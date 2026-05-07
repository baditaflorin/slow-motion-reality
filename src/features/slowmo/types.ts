export type RendererMode = "webgpu" | "canvas";

export type ExperienceState =
  | "idle"
  | "requesting"
  | "running"
  | "stopped"
  | "error";

export type LogEntry = {
  id: string;
  message: string;
  at: string;
};

export type SupportReport = {
  camera: boolean;
  microphone: boolean;
  webgpu: boolean;
  webAudio: boolean;
  crossOriginIsolated: boolean;
  onnx: boolean;
};

export type SlowMotionSettings = {
  bufferSeconds: number;
  distortion: number;
  audioMix: number;
  rendererMode: RendererMode;
};

export type CapturedFrame = {
  bitmap: ImageBitmap;
  timestamp: number;
};

export type RifeStatus = {
  ready: boolean;
  loading: boolean;
  error?: string;
  modelName?: string;
};
