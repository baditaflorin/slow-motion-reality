import type { CapturedFrame } from "./types";

export class FrameBuffer {
  private frames: CapturedFrame[] = [];
  private readonly maxAgeMs: number;

  constructor(maxAgeMs: number) {
    this.maxAgeMs = maxAgeMs;
  }

  add(frame: CapturedFrame): void {
    this.frames.push(frame);
    this.prune(frame.timestamp);
  }

  clear(): void {
    for (const frame of this.frames) {
      frame.bitmap.close();
    }
    this.frames = [];
  }

  get size(): number {
    return this.frames.length;
  }

  getDurationMs(): number {
    const first = this.frames.at(0);
    const last = this.frames.at(-1);
    if (!first || !last) {
      return 0;
    }
    return Math.max(0, last.timestamp - first.timestamp);
  }

  sample(
    targetTimestamp: number,
  ):
    | { current: CapturedFrame; next: CapturedFrame; alpha: number }
    | undefined {
    if (this.frames.length < 2) {
      return undefined;
    }

    const first = this.frames[0];
    const last = this.frames[this.frames.length - 1];
    const clamped = Math.min(
      Math.max(targetTimestamp, first.timestamp),
      last.timestamp,
    );

    for (let index = 0; index < this.frames.length - 1; index += 1) {
      const current = this.frames[index];
      const next = this.frames[index + 1];
      if (current.timestamp <= clamped && next.timestamp >= clamped) {
        const span = Math.max(1, next.timestamp - current.timestamp);
        return { current, next, alpha: (clamped - current.timestamp) / span };
      }
    }

    return { current: last, next: last, alpha: 0 };
  }

  private prune(now: number): void {
    const cutoff = now - this.maxAgeMs;
    while (this.frames.length > 2 && this.frames[0].timestamp < cutoff) {
      this.frames.shift()?.bitmap.close();
    }
  }
}
