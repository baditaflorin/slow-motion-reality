import { describe, expect, it, vi } from "vitest";
import { FrameBuffer } from "./frameBuffer";

function bitmap() {
  return { close: vi.fn() } as unknown as ImageBitmap;
}

describe("FrameBuffer", () => {
  it("samples adjacent frames with interpolation alpha", () => {
    const buffer = new FrameBuffer(1000);
    const first = bitmap();
    const second = bitmap();
    buffer.add({ bitmap: first, timestamp: 100 });
    buffer.add({ bitmap: second, timestamp: 200 });

    const sample = buffer.sample(150);

    expect(sample?.current.bitmap).toBe(first);
    expect(sample?.next.bitmap).toBe(second);
    expect(sample?.alpha).toBe(0.5);
  });

  it("prunes old frames and closes bitmaps", () => {
    const buffer = new FrameBuffer(100);
    const stale = bitmap();
    buffer.add({ bitmap: stale, timestamp: 0 });
    buffer.add({ bitmap: bitmap(), timestamp: 50 });
    buffer.add({ bitmap: bitmap(), timestamp: 250 });

    expect(buffer.size).toBe(2);
    expect(stale.close).toHaveBeenCalled();
  });
});
