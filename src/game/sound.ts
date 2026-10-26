class SoundManager {
  public muted = false;
  private ctx: AudioContext | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  private initCtx(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playFile(path: string, volume = 0.65, playbackRate = 1.0): void {
    if (this.muted || typeof window === 'undefined') return;
    try {
      let base = this.audioCache.get(path);
      if (!base) {
        base = new Audio(path);
        this.audioCache.set(path, base);
      }
      const clone = base.cloneNode() as HTMLAudioElement;
      clone.volume = Math.max(0, Math.min(1, volume));
      clone.playbackRate = playbackRate;
      clone.play().catch(() => {});
    } catch {
      // Fallback handled by Web Audio synth
    }
  }

  public playGrab(): void {
    if (this.muted) return;
    this.playFile('/assets/pen-fight/pen-grab-1-hzdf8ppz.mp3', 0.45);
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(310, ctx.currentTime + 0.045);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.055);
  }

  public playFlick(power = 0.7): void {
    if (this.muted) return;
    const file =
      power > 0.65
        ? '/assets/pen-fight/pen-flick-2-Bs5TTz2o.mp3'
        : '/assets/pen-fight/pen-flick-1-zC0UYxZa.mp3';
    this.playFile(file, Math.min(0.85, 0.35 + power * 0.5), 0.94 + Math.random() * 0.12);
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160 + power * 120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(85, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.08 * power, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.075);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  public playCollision(impactSpeed: number, isMetal = false): void {
    if (this.muted) return;
    const norm = Math.max(0.25, Math.min(1, impactSpeed / 320));
    const file = isMetal
      ? '/assets/pen-fight/pen-ting-metal-1-WSOsqEp4.mp3'
      : impactSpeed > 180
      ? '/assets/pen-fight/pen-hit-plastic-2-BCjfQA6k.mp3'
      : '/assets/pen-fight/pen-hit-plastic-1-Dd-Xhuiq.mp3';
    this.playFile(file, norm * 0.85, 0.92 + Math.random() * 0.16);
  }

  public playFallOff(): void {
    if (this.muted) return;
    this.playFile('/assets/pen-fight/pen-fall-floor-1-sEfEG-fl.mp3', 0.75);
  }

  public playTurnChange(): void {
    if (this.muted) return;
    this.playFile('/assets/pen-fight/turn-change-DZ1866Us.mp3', 0.45);
  }

  public playWin(): void {
    if (this.muted) return;
    this.playFile('/assets/pen-fight/win-xylophone-jRmG6sqe.mp3', 0.7);
  }

  public playLose(): void {
    if (this.muted) return;
    this.playFile('/assets/pen-fight/lose-steel-C_cT7fWd.mp3', 0.65);
  }
}

export const sound = new SoundManager();
