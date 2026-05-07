import type { SupportReport } from "./types";

export function getSupportReport(): SupportReport {
  const mediaDevices = navigator.mediaDevices;

  return {
    camera: Boolean(mediaDevices?.getUserMedia),
    microphone: Boolean(mediaDevices?.getUserMedia),
    webgpu: "gpu" in navigator,
    webAudio: "AudioContext" in window || "webkitAudioContext" in window,
    crossOriginIsolated: window.crossOriginIsolated,
    onnx: typeof Worker !== "undefined" && typeof WebAssembly !== "undefined",
  };
}

export function formatBoolean(value: boolean): string {
  return value ? "ready" : "missing";
}
