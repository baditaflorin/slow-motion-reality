import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlowAudioEngine } from "./audio";
import { getSupportReport } from "./browserSupport";
import { FrameBuffer } from "./frameBuffer";
import { RifeClient } from "./rifeClient";
import { SlowMotionRenderer } from "./webgpuRenderer";
import type {
  ExperienceState,
  LogEntry,
  RendererMode,
  RifeStatus,
  SlowMotionSettings,
} from "./types";

const DEFAULT_SETTINGS: SlowMotionSettings = {
  audioMix: 0.82,
  bufferSeconds: 10,
  distortion: 0.78,
  rendererMode: "webgpu",
};

export function useSlowMotionExperience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rendererRef = useRef<SlowMotionRenderer | null>(null);
  const audioRef = useRef(new SlowAudioEngine());
  const streamRef = useRef<MediaStream | null>(null);
  const frameBufferRef = useRef(
    new FrameBuffer(DEFAULT_SETTINGS.bufferSeconds * 1000),
  );
  const animationRef = useRef<number | undefined>(undefined);
  const captureRef = useRef<number | undefined>(undefined);
  const playbackStartRef = useRef<number | undefined>(undefined);
  const playbackSourceStartRef = useRef<number | undefined>(undefined);
  const rifeBusyRef = useRef(false);
  const rifeFrameRef = useRef<ImageBitmap | undefined>(undefined);
  const rifeRef = useRef(new RifeClient());
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [state, setState] = useState<ExperienceState>("idle");
  const [error, setError] = useState<string>();
  const [rendererMode, setRendererMode] = useState<RendererMode>("canvas");
  const [fps, setFps] = useState(0);
  const [bufferDepth, setBufferDepth] = useState(0);
  const [rifeStatus, setRifeStatus] = useState<RifeStatus>({
    ready: false,
    loading: false,
  });
  const [log, setLog] = useState<LogEntry[]>([]);
  const support = useMemo(() => getSupportReport(), []);

  const appendLog = useCallback((message: string) => {
    setLog((entries) =>
      [
        {
          id: crypto.randomUUID(),
          at: new Date().toLocaleTimeString(),
          message,
        },
        ...entries,
      ].slice(0, 8),
    );
  }, []);

  const requestRifeFrame = useCallback(
    (first: ImageBitmap, second: ImageBitmap, alpha: number): void => {
      if (!rifeRef.current.status.ready || rifeBusyRef.current) {
        return;
      }
      rifeBusyRef.current = true;
      void Promise.all([createImageBitmap(first), createImageBitmap(second)])
        .then(([firstClone, secondClone]) =>
          rifeRef.current.interpolate(firstClone, secondClone, alpha),
        )
        .then((bitmap) => {
          rifeFrameRef.current?.close();
          rifeFrameRef.current = bitmap;
        })
        .catch((rifeError) => {
          appendLog(
            rifeError instanceof Error ? rifeError.message : String(rifeError),
          );
        })
        .finally(() => {
          rifeBusyRef.current = false;
        });
    },
    [appendLog],
  );

  const startCapture = useCallback((video: HTMLVideoElement): void => {
    captureRef.current = window.setInterval(() => {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }
      void createImageBitmap(video).then((bitmap) => {
        frameBufferRef.current.add({ bitmap, timestamp: performance.now() });
        setBufferDepth(frameBufferRef.current.getDurationMs() / 1000);
      });
    }, 1000 / 30);
  }, []);

  const startPlaybackLoop = useCallback((): void => {
    let frames = 0;
    let fpsStartedAt = performance.now();

    const render = () => {
      const now = performance.now();
      const buffer = frameBufferRef.current;
      const duration = buffer.getDurationMs();
      if (duration > 900) {
        if (!playbackStartRef.current || !playbackSourceStartRef.current) {
          playbackStartRef.current = now;
          playbackSourceStartRef.current =
            now - Math.min(duration - 350, settings.bufferSeconds * 760);
        }
        const elapsed = now - playbackStartRef.current;
        const targetTimestamp = playbackSourceStartRef.current + elapsed / 4;
        const sample = buffer.sample(targetTimestamp);
        if (sample) {
          requestRifeFrame(
            sample.current.bitmap,
            sample.next.bitmap,
            sample.alpha,
          );
          const rifeFrame = rifeFrameRef.current;
          if (rifeFrame) {
            rendererRef.current?.render({
              current: rifeFrame,
              next: rifeFrame,
              alpha: 0,
              distortion: settings.distortion,
              time: now,
            });
            animationRef.current = requestAnimationFrame(render);
            return;
          }
          rendererRef.current?.render({
            current: sample.current.bitmap,
            next: sample.next.bitmap,
            alpha: sample.alpha,
            distortion: settings.distortion,
            time: now,
          });
        }
      }

      frames += 1;
      if (now - fpsStartedAt >= 1000) {
        setFps(frames);
        frames = 0;
        fpsStartedAt = now;
      }
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
  }, [requestRifeFrame, settings.bufferSeconds, settings.distortion]);

  const stop = useCallback(async () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (captureRef.current) {
      window.clearInterval(captureRef.current);
    }
    animationRef.current = undefined;
    captureRef.current = undefined;
    playbackStartRef.current = undefined;
    playbackSourceStartRef.current = undefined;
    rifeFrameRef.current?.close();
    rifeFrameRef.current = undefined;
    rifeBusyRef.current = false;
    frameBufferRef.current.clear();
    rendererRef.current?.clear();
    await audioRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setBufferDepth(0);
    setFps(0);
    setState("stopped");
    appendLog("Session stopped");
  }, [appendLog]);

  const start = useCallback(async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      return;
    }

    setState("requesting");
    setError(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: {
          facingMode: "environment",
          frameRate: { ideal: 30, max: 60 },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      rendererRef.current = new SlowMotionRenderer(canvas);
      const mode = await rendererRef.current.initialize(settings.rendererMode);
      setRendererMode(mode);
      await audioRef.current.start(
        stream,
        settings.audioMix,
        Math.max(0.4, settings.bufferSeconds * 0.32),
      );
      appendLog(`Renderer initialized in ${mode.toUpperCase()} mode`);

      frameBufferRef.current = new FrameBuffer(settings.bufferSeconds * 1000);
      startCapture(video);
      startPlaybackLoop();
      setState("running");
    } catch (startError) {
      const message =
        startError instanceof Error ? startError.message : String(startError);
      setError(message);
      setState("error");
      appendLog(message);
      await stop();
    }
  }, [
    appendLog,
    settings.audioMix,
    settings.bufferSeconds,
    settings.rendererMode,
    startCapture,
    startPlaybackLoop,
    stop,
  ]);

  const loadRifeModel = useCallback(
    async (file: File) => {
      appendLog(`Loading ONNX model ${file.name}`);
      await rifeRef.current.load(file, setRifeStatus);
    },
    [appendLog],
  );

  useEffect(() => {
    audioRef.current.setMix(settings.audioMix);
  }, [settings.audioMix]);

  useEffect(() => {
    const rife = rifeRef.current;
    return () => {
      void stop();
      rife.destroy();
    };
  }, [stop]);

  return {
    canvasRef,
    videoRef,
    state,
    error,
    settings,
    setSettings,
    support,
    rendererMode,
    fps,
    bufferDepth,
    rifeStatus,
    log,
    start,
    stop,
    loadRifeModel,
  };
}
