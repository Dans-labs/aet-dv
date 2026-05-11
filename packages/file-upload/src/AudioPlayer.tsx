import { useRef, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  src: string;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
  onPlay?: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
  onPause?: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
  mediaRef: React.RefObject<HTMLAudioElement>;
}

export function AudioPlayer({ src, onTimeUpdate, onPlay, onPause, mediaRef }: AudioPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const startedRef = useRef(false);

  const initAudio = useCallback(() => {
    if (startedRef.current || !mediaRef.current) return;
    startedRef.current = true;

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    const source = audioCtx.createMediaElementSource(mediaRef.current);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;
  }, [mediaRef]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d")!;
    const W = canvas.width / devicePixelRatio;
    const H = canvas.height / devicePixelRatio;
    const bins = analyser.frequencyBinCount;
    const data = new Uint8Array(bins);
    // only draw the lower 50% of bins
    const usefulBins = Math.floor(bins * 0.5);
    analyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const gap = 2;
    const barW = (W - gap * usefulBins) / usefulBins;

    for (let i = 0; i < usefulBins; i++) {
      const x = i * (barW + gap);
      const v = data[i] / 255;
      const h = Math.max(2, v * H);
      ctx.fillStyle = `rgba(25, 118, 210, ${0.4 + v * 0.6})`;
      ctx.beginPath();
      ctx.roundRect(x, H - h, barW, h, 2);
      ctx.fill();
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = 80 * devicePixelRatio;
  }, []);

  const handlePlay = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    initAudio();
    if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
    resizeCanvas();
    draw();
    onPlay?.(e);
  }, [initAudio, resizeCanvas, draw, onPlay]);

  const handlePause = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    cancelAnimationFrame(rafRef.current);
    onPause?.(e);
  }, [onPause]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ width: "100%", borderRadius: 3, overflow: "hidden", lineHeight: 0 }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 80,
          display: "block",
          background: "var(--bs-secondary-bg, #f5f5f5)",
        }}
      />
      <audio
        ref={mediaRef}
        crossOrigin="anonymous"
        src={src}
        controls
        onTimeUpdate={onTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handlePause}
        style={{ width: "100%" }}
      />
    </div>
  );
}