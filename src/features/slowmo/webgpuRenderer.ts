import type { RendererMode } from "./types";

type RenderFrame = {
  current: ImageBitmap;
  next: ImageBitmap;
  alpha: number;
  distortion: number;
  time: number;
};

const shader = `
struct Uniforms {
  alpha: f32,
  distortion: f32,
  time: f32,
  pad: f32,
};

@group(0) @binding(0) var currentTexture: texture_2d<f32>;
@group(0) @binding(1) var nextTexture: texture_2d<f32>;
@group(0) @binding(2) var frameSampler: sampler;
@group(0) @binding(3) var<uniform> uniforms: Uniforms;

struct VertexOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOut {
  var positions = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(1.0, 1.0)
  );

  var uvs = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 1.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 0.0),
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(1.0, 0.0)
  );

  var out: VertexOut;
  out.position = vec4<f32>(positions[index], 0.0, 1.0);
  out.uv = uvs[index];
  return out;
}

@fragment
fn fragmentMain(input: VertexOut) -> @location(0) vec4<f32> {
  let wave = sin((input.uv.y * 18.0) + uniforms.time * 0.0013) * uniforms.distortion * 0.018;
  let pull = cos((input.uv.x * 12.0) - uniforms.time * 0.0011) * uniforms.distortion * 0.012;
  let uv = clamp(input.uv + vec2<f32>(wave, pull), vec2<f32>(0.001), vec2<f32>(0.999));
  let a = textureSample(currentTexture, frameSampler, uv);
  let b = textureSample(nextTexture, frameSampler, uv);
  let slow = mix(a, b, uniforms.alpha);
  let glow = vec4<f32>(0.04, 0.09, 0.08, 0.0) * uniforms.distortion;
  return vec4<f32>(slow.rgb + glow.rgb, 1.0);
}
`;

export class SlowMotionRenderer {
  private mode: RendererMode = "canvas";
  private context2d?: CanvasRenderingContext2D;
  private gpu?: {
    context: GPUCanvasContext;
    device: GPUDevice;
    format: GPUTextureFormat;
    pipeline: GPURenderPipeline;
    sampler: GPUSampler;
    uniformBuffer: GPUBuffer;
    bindGroupLayout: GPUBindGroupLayout;
  };

  private readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async initialize(preferredMode: RendererMode): Promise<RendererMode> {
    this.resize();
    if (preferredMode === "webgpu" && "gpu" in navigator) {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        const device = await adapter.requestDevice();
        const context = this.canvas.getContext(
          "webgpu",
        ) as GPUCanvasContext | null;
        if (context) {
          const format = navigator.gpu.getPreferredCanvasFormat();
          context.configure({ device, format, alphaMode: "opaque" });
          const bindGroupLayout = device.createBindGroupLayout({
            entries: [
              { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
              { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
              { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
              {
                binding: 3,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform" },
              },
            ],
          });
          const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
          });
          const module = device.createShaderModule({ code: shader });
          const pipeline = device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: { module, entryPoint: "vertexMain" },
            fragment: {
              module,
              entryPoint: "fragmentMain",
              targets: [{ format }],
            },
            primitive: { topology: "triangle-list" },
          });
          this.gpu = {
            context,
            device,
            format,
            pipeline,
            sampler: device.createSampler({
              magFilter: "linear",
              minFilter: "linear",
            }),
            uniformBuffer: device.createBuffer({
              size: 16,
              usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            }),
            bindGroupLayout,
          };
          this.mode = "webgpu";
          return this.mode;
        }
      }
    }

    const context2d = this.canvas.getContext("2d");
    if (!context2d) {
      throw new Error("Canvas rendering is not available.");
    }
    this.context2d = context2d;
    this.mode = "canvas";
    return this.mode;
  }

  getMode(): RendererMode {
    return this.mode;
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  render(frame: RenderFrame): void {
    this.resize();
    if (this.mode === "webgpu" && this.gpu) {
      this.renderWebGpu(frame);
      return;
    }
    this.renderCanvas(frame);
  }

  clear(): void {
    this.context2d?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderCanvas(frame: RenderFrame): void {
    const context = this.context2d;
    if (!context) {
      return;
    }
    context.save();
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.globalAlpha = 1;
    context.filter = `saturate(${1 + frame.distortion * 0.22}) blur(${frame.distortion * 0.7}px)`;
    context.drawImage(
      frame.current,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
    context.globalAlpha = frame.alpha;
    context.drawImage(frame.next, 0, 0, this.canvas.width, this.canvas.height);
    context.fillStyle = `rgba(115, 183, 255, ${0.05 * frame.distortion})`;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    context.restore();
  }

  private renderWebGpu(frame: RenderFrame): void {
    const gpu = this.gpu;
    if (!gpu) {
      return;
    }

    const current = this.createBitmapTexture(frame.current);
    const next = this.createBitmapTexture(frame.next);
    const uniforms = new Float32Array([
      frame.alpha,
      frame.distortion,
      frame.time,
      0,
    ]);
    gpu.device.queue.writeBuffer(gpu.uniformBuffer, 0, uniforms);

    const bindGroup = gpu.device.createBindGroup({
      layout: gpu.bindGroupLayout,
      entries: [
        { binding: 0, resource: current.createView() },
        { binding: 1, resource: next.createView() },
        { binding: 2, resource: gpu.sampler },
        { binding: 3, resource: { buffer: gpu.uniformBuffer } },
      ],
    });
    const encoder = gpu.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: gpu.context.getCurrentTexture().createView(),
          clearValue: { r: 0.02, g: 0.03, b: 0.035, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.setPipeline(gpu.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6);
    pass.end();
    gpu.device.queue.submit([encoder.finish()]);
    current.destroy();
    next.destroy();
  }

  private createBitmapTexture(bitmap: ImageBitmap): GPUTexture {
    const gpu = this.gpu;
    if (!gpu) {
      throw new Error("WebGPU renderer is not initialized.");
    }
    const texture = gpu.device.createTexture({
      size: [bitmap.width, bitmap.height, 1],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    gpu.device.queue.copyExternalImageToTexture(
      { source: bitmap },
      { texture },
      [bitmap.width, bitmap.height],
    );
    return texture;
  }
}
