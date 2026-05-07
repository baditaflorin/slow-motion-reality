import {
  Aperture,
  AudioWaveform,
  CircleStop,
  Gauge,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from "lucide-react";
import { formatBoolean } from "./browserSupport";
import { useSlowMotionExperience } from "./useSlowMotionExperience";

export function SlowMotionApp() {
  const {
    bufferDepth,
    canvasRef,
    error,
    fps,
    loadRifeModel,
    log,
    rendererMode,
    rifeStatus,
    setSettings,
    settings,
    start,
    state,
    stop,
    support,
    videoRef,
  } = useSlowMotionExperience();
  const isRunning = state === "running" || state === "requesting";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Sparkles size={22} />
          </span>
          <div>
            <h1>Slow-motion Reality</h1>
            <p>
              Camera, WebGPU, RIFE ONNX, and buffered Web Audio at dream-water
              speed.
            </p>
          </div>
        </div>
        <div className="status-pill" data-active={state === "running"}>
          <span className="status-dot" />
          {state}
        </div>
      </header>

      <section className="workbench">
        <div className="stage" aria-label="Slow-motion camera stage">
          <canvas ref={canvasRef} />
          <video ref={videoRef} playsInline muted />
          {!isRunning ? (
            <div className="stage-empty">
              <div>
                <h2>Walk through your room at one-quarter time.</h2>
                <p>
                  Start the camera, allow microphone access, and the app buffers
                  reality into a slower, heavier stream that stays entirely on
                  this device.
                </p>
              </div>
            </div>
          ) : null}
          <div className="stage-overlay" aria-live="polite">
            <div className="meter">
              <span>Renderer</span>
              <strong>{rendererMode}</strong>
            </div>
            <div className="meter">
              <span>Buffer</span>
              <strong>{bufferDepth.toFixed(1)}s</strong>
            </div>
            <div className="meter">
              <span>Frames</span>
              <strong>{fps} fps</strong>
            </div>
          </div>
        </div>

        <aside className="controls" aria-label="Slow-motion controls">
          <section className="panel">
            <h2>Transport</h2>
            <div className="button-row">
              <button
                className="primary-button"
                type="button"
                onClick={() => void start()}
                disabled={isRunning}
              >
                <Play size={18} />
                Start
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => void stop()}
                disabled={!isRunning}
                title="Stop"
                aria-label="Stop"
              >
                <CircleStop size={18} />
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => window.location.reload()}
                title="Reset"
                aria-label="Reset"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            {error ? <p className="error">{error}</p> : null}
          </section>

          <section className="panel">
            <h2>
              <SlidersHorizontal size={16} /> Slow field
            </h2>
            <div className="control">
              <label htmlFor="buffer">
                Frame buffer: {settings.bufferSeconds}s
              </label>
              <input
                id="buffer"
                min="4"
                max="20"
                step="1"
                type="range"
                value={settings.bufferSeconds}
                onChange={(event) =>
                  setSettings((currentSettings) => ({
                    ...currentSettings,
                    bufferSeconds: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="control">
              <label htmlFor="distortion">
                Dream-water: {settings.distortion.toFixed(2)}
              </label>
              <input
                id="distortion"
                min="0"
                max="1"
                step="0.01"
                type="range"
                value={settings.distortion}
                onChange={(event) =>
                  setSettings((currentSettings) => ({
                    ...currentSettings,
                    distortion: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="control">
              <label htmlFor="audio">
                Buffered audio: {Math.round(settings.audioMix * 100)}%
              </label>
              <input
                id="audio"
                min="0"
                max="1"
                step="0.01"
                type="range"
                value={settings.audioMix}
                onChange={(event) =>
                  setSettings((currentSettings) => ({
                    ...currentSettings,
                    audioMix: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="control">
              <span className="file-label">Renderer preference</span>
              <div className="segmented">
                <button
                  type="button"
                  aria-pressed={settings.rendererMode === "webgpu"}
                  onClick={() =>
                    setSettings((currentSettings) => ({
                      ...currentSettings,
                      rendererMode: "webgpu",
                    }))
                  }
                >
                  WebGPU
                </button>
                <button
                  type="button"
                  aria-pressed={settings.rendererMode === "canvas"}
                  onClick={() =>
                    setSettings((currentSettings) => ({
                      ...currentSettings,
                      rendererMode: "canvas",
                    }))
                  }
                >
                  Canvas
                </button>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>
              <Aperture size={16} /> RIFE interpolation
            </h2>
            <label className="file-label" htmlFor="rife-model">
              Load a compatible RIFE ONNX model
            </label>
            <input
              id="rife-model"
              className="file-input"
              type="file"
              accept=".onnx,application/octet-stream"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) {
                  void loadRifeModel(file);
                }
              }}
            />
            <p className="status-pill" data-active={rifeStatus.ready}>
              <Upload size={14} />
              {rifeStatus.loading
                ? "loading model"
                : rifeStatus.ready
                  ? rifeStatus.modelName
                  : "blend fallback active"}
            </p>
          </section>

          <section className="panel">
            <h2>
              <Gauge size={16} /> Device support
            </h2>
            <dl className="support-list">
              {Object.entries(support).map(([key, value]) => (
                <div className="support-row" key={key}>
                  <dt>{key}</dt>
                  <dd>{formatBoolean(value)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="panel">
            <h2>
              <AudioWaveform size={16} /> Event log
            </h2>
            <ul className="event-log">
              {log.length ? (
                log.map((entry) => (
                  <li key={entry.id}>
                    {entry.at} {entry.message}
                  </li>
                ))
              ) : (
                <li>Waiting for first session.</li>
              )}
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
