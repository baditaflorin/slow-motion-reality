type WebKitAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export class SlowAudioEngine {
  private context?: AudioContext;
  private source?: MediaStreamAudioSourceNode;
  private delay?: DelayNode;
  private dryGain?: GainNode;
  private wetGain?: GainNode;
  private filter?: BiquadFilterNode;

  async start(
    stream: MediaStream,
    mix: number,
    delaySeconds: number,
  ): Promise<void> {
    const AudioContextCtor =
      window.AudioContext ?? (window as WebKitAudioWindow).webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error("Web Audio is not available in this browser.");
    }

    await this.stop();
    this.context = new AudioContextCtor();
    this.source = this.context.createMediaStreamSource(stream);
    this.delay = this.context.createDelay(Math.max(1, delaySeconds + 1));
    this.dryGain = this.context.createGain();
    this.wetGain = this.context.createGain();
    this.filter = this.context.createBiquadFilter();

    this.delay.delayTime.value = delaySeconds;
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1600;
    this.filter.Q.value = 0.72;
    this.applyMix(mix);

    this.source.connect(this.dryGain);
    this.source.connect(this.delay);
    this.delay.connect(this.filter);
    this.filter.connect(this.wetGain);
    this.dryGain.connect(this.context.destination);
    this.wetGain.connect(this.context.destination);

    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  setMix(mix: number): void {
    this.applyMix(mix);
  }

  async stop(): Promise<void> {
    this.source?.disconnect();
    this.delay?.disconnect();
    this.dryGain?.disconnect();
    this.wetGain?.disconnect();
    this.filter?.disconnect();

    if (this.context && this.context.state !== "closed") {
      await this.context.close();
    }

    this.context = undefined;
    this.source = undefined;
    this.delay = undefined;
    this.dryGain = undefined;
    this.wetGain = undefined;
    this.filter = undefined;
  }

  private applyMix(mix: number): void {
    const wet = Math.min(1, Math.max(0, mix));
    const dry = 1 - wet * 0.88;
    if (this.dryGain) {
      this.dryGain.gain.value = dry;
    }
    if (this.wetGain) {
      this.wetGain.gain.value = wet;
    }
  }
}
