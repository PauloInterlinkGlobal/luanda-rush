/**
 * AudioManager — todos os sons são sintetizados em WebAudio.
 * Nada de gravações protegidas; funciona offline e sem ficheiros.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private ambientNodes: AudioNode[] = [];

  sfxEnabled = true;
  musicEnabled = true;
  private tempo = 132;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.16;
      this.musicGain.connect(this.master);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  unlock(): void {
    this.ensure();
  }

  private blip(
    freq: number,
    duration: number,
    type: OscillatorType,
    gain: number,
    slideTo?: number,
  ): void {
    const ctx = this.ensure();
    if (!ctx || !this.master || !this.sfxEnabled) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, slideTo),
        ctx.currentTime + duration,
      );
    }
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  private noise(duration: number, gain: number, filterFreq: number): void {
    const ctx = this.ensure();
    if (!ctx || !this.master || !this.sfxEnabled) return;
    const frames = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start();
  }

  // --- Efeitos de jogo ---
  step(): void {
    this.noise(0.08, 0.06, 900);
  }
  call(): void {
    this.blip(420, 0.18, "square", 0.16, 700);
    window.setTimeout(() => this.blip(620, 0.14, "square", 0.12, 480), 90);
  }
  horn(): void {
    this.blip(300, 0.3, "sawtooth", 0.14);
    this.blip(380, 0.3, "sawtooth", 0.1);
  }
  engine(): void {
    this.noise(0.6, 0.07, 320);
  }
  accept(): void {
    this.blip(660, 0.12, "triangle", 0.18, 990);
  }
  reward(): void {
    [523, 659, 784, 1046].forEach((f, i) =>
      window.setTimeout(() => this.blip(f, 0.16, "triangle", 0.16), i * 70),
    );
  }
  taxiFull(): void {
    [392, 523, 659, 784, 1046].forEach((f, i) =>
      window.setTimeout(() => this.blip(f, 0.2, "square", 0.14), i * 80),
    );
  }
  combo(level: number): void {
    this.blip(500 + level * 90, 0.14, "square", 0.15, 800 + level * 100);
  }
  lost(): void {
    this.blip(320, 0.25, "sawtooth", 0.14, 120);
  }
  powerUp(): void {
    this.blip(300, 0.35, "sawtooth", 0.16, 1200);
  }
  ui(): void {
    this.blip(700, 0.07, "square", 0.1);
  }

  // --- Música ---
  private melodyStep = 0;
  startMusic(rush = false): void {
    const ctx = this.ensure();
    if (!ctx || !this.musicEnabled) return;
    this.stopMusic();
    this.tempo = rush ? 168 : 126;
    const bass = [110, 110, 146.8, 130.8];
    const lead = [440, 523, 587, 523, 659, 587, 523, 440];
    const interval = (60 / this.tempo) * 1000;
    this.melodyStep = 0;
    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled) return;
      const c = this.ensure();
      if (!c || !this.musicGain) return;
      const step = this.melodyStep++;
      const play = (freq: number, dur: number, type: OscillatorType, gain: number) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, c.currentTime);
        g.gain.exponentialRampToValueAtTime(gain, c.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
        osc.connect(g);
        g.connect(this.musicGain!);
        osc.start();
        osc.stop(c.currentTime + dur + 0.03);
      };
      play(bass[step % bass.length] ?? 110, 0.3, "triangle", 0.4);
      if (step % 2 === 0) play(lead[(step / 2) % lead.length] ?? 440, 0.22, "square", 0.16);
      if (step % 4 === 2) this.noise(0.08, 0.05, 4000);
    }, interval);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  /** Ambiente urbano leve (trânsito distante). */
  startAmbient(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    this.stopAmbient();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 220;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start();
    this.ambientNodes = [src, filter, g];
  }

  stopAmbient(): void {
    this.ambientNodes.forEach((n) => {
      try {
        (n as AudioBufferSourceNode).stop?.();
      } catch {
        /* já parado */
      }
      n.disconnect();
    });
    this.ambientNodes = [];
  }

  destroy(): void {
    this.stopMusic();
    this.stopAmbient();
    void this.ctx?.close();
    this.ctx = null;
  }
}

export const audio = new AudioManager();
