import type { RifeStatus } from "./types";

type WorkerMessage =
  | { type: "ready"; modelName: string }
  | { type: "error"; error: string }
  | { type: "frame"; bitmap: ImageBitmap };

export class RifeClient {
  private worker?: Worker;
  private pending?: {
    resolve: (bitmap: ImageBitmap) => void;
    reject: (error: Error) => void;
  };

  status: RifeStatus = { ready: false, loading: false };

  async load(
    file: File,
    onStatus: (status: RifeStatus) => void,
  ): Promise<void> {
    this.destroy();
    this.status = { ready: false, loading: true, modelName: file.name };
    onStatus(this.status);
    const model = await file.arrayBuffer();
    this.worker = new Worker(new URL("./rifeWorker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      if (event.data.type === "ready") {
        this.status = {
          ready: true,
          loading: false,
          modelName: event.data.modelName,
        };
        onStatus(this.status);
        return;
      }
      if (event.data.type === "error") {
        const error = new Error(event.data.error);
        this.status = {
          ready: false,
          loading: false,
          error: error.message,
          modelName: file.name,
        };
        this.pending?.reject(error);
        this.pending = undefined;
        onStatus(this.status);
        return;
      }
      this.pending?.resolve(event.data.bitmap);
      this.pending = undefined;
    };
    this.worker.postMessage({ type: "init", model, modelName: file.name }, [
      model,
    ]);
  }

  interpolate(
    first: ImageBitmap,
    second: ImageBitmap,
    alpha: number,
  ): Promise<ImageBitmap> {
    if (!this.worker || !this.status.ready || this.pending) {
      return Promise.reject(new Error("RIFE is not ready."));
    }
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };
      this.worker?.postMessage({ type: "interpolate", first, second, alpha }, [
        first,
        second,
      ]);
    });
  }

  destroy(): void {
    this.worker?.terminate();
    this.pending?.reject(new Error("RIFE worker was stopped."));
    this.worker = undefined;
    this.pending = undefined;
    this.status = { ready: false, loading: false };
  }
}
