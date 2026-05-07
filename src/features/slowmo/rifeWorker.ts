import * as ort from "onnxruntime-web";

type InitMessage = {
  type: "init";
  model: ArrayBuffer;
  modelName: string;
};

type InterpolateMessage = {
  type: "interpolate";
  alpha: number;
  first: ImageBitmap;
  second: ImageBitmap;
};

type IncomingMessage = InitMessage | InterpolateMessage;

let session: ort.InferenceSession | undefined;
let inputNames: readonly string[] = [];
let outputName = "";

self.onmessage = async (event: MessageEvent<IncomingMessage>) => {
  try {
    if (event.data.type === "init") {
      session = await ort.InferenceSession.create(event.data.model, {
        executionProviders: ["webgpu", "wasm"],
        graphOptimizationLevel: "all",
      });
      inputNames = session.inputNames;
      outputName = session.outputNames[0];
      self.postMessage({ type: "ready", modelName: event.data.modelName });
      return;
    }

    if (!session) {
      self.postMessage({ type: "error", error: "RIFE model is not loaded." });
      return;
    }

    const result = await runInterpolation(
      event.data.first,
      event.data.second,
      event.data.alpha,
    );
    (self as DedicatedWorkerGlobalScope).postMessage(
      { type: "frame", bitmap: result },
      [result],
    );
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

async function runInterpolation(
  first: ImageBitmap,
  second: ImageBitmap,
  alpha: number,
): Promise<ImageBitmap> {
  const width = Math.min(first.width, second.width, 512);
  const height = Math.min(first.height, second.height, 288);
  const firstTensor = await bitmapToTensor(first, width, height);
  const secondTensor = await bitmapToTensor(second, width, height);
  const timestep = new ort.Tensor("float32", Float32Array.from([alpha]), [1]);

  const feeds: Record<string, ort.Tensor> = {};
  feeds[inputNames[0] ?? "I0"] = firstTensor;
  feeds[inputNames[1] ?? "I1"] = secondTensor;
  if (inputNames[2]) {
    feeds[inputNames[2]] = timestep;
  }

  const outputs = await session!.run(feeds);
  const output = outputs[outputName];
  return tensorToBitmap(output, width, height);
}

async function bitmapToTensor(
  bitmap: ImageBitmap,
  width: number,
  height: number,
): Promise<ort.Tensor> {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("OffscreenCanvas 2D context is unavailable.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  const image = context.getImageData(0, 0, width, height);
  const data = new Float32Array(1 * 3 * height * width);
  for (let index = 0; index < width * height; index += 1) {
    data[index] = image.data[index * 4] / 255;
    data[height * width + index] = image.data[index * 4 + 1] / 255;
    data[2 * height * width + index] = image.data[index * 4 + 2] / 255;
  }
  return new ort.Tensor("float32", data, [1, 3, height, width]);
}

function tensorToBitmap(
  tensor: ort.Tensor,
  width: number,
  height: number,
): Promise<ImageBitmap> {
  const data = tensor.data as Float32Array;
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("OffscreenCanvas 2D context is unavailable.");
  }
  const image = context.createImageData(width, height);
  for (let index = 0; index < width * height; index += 1) {
    image.data[index * 4] = clampByte(data[index] * 255);
    image.data[index * 4 + 1] = clampByte(data[height * width + index] * 255);
    image.data[index * 4 + 2] = clampByte(
      data[2 * height * width + index] * 255,
    );
    image.data[index * 4 + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  return createImageBitmap(canvas);
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
