import { LiveNumber } from './live-number';

type ECGTraceProps = {
  astronautId: string;
  color: string;
  heartRate: number;
  hrv: number;
};

function seedFromId(id: string) {
  return id.split('').reduce((seed, character) => seed + character.charCodeAt(0), 0);
}

function buildECGPath(astronautId: string, heartRate: number, hrv: number) {
  const seed = seedFromId(astronautId);
  const baseline = 18 + (seed % 3) - 1;
  const peakHeight = Math.max(10, Math.min(17, 10 + (heartRate - 55) * 0.08 + (seed % 4)));
  const tWave = Math.max(2, Math.min(6, 2 + hrv * 0.035));
  const beatWidth = 106;
  const points: string[] = [`M0 ${baseline}`];

  for (let beat = 0; beat < 4; beat += 1) {
    const start = beat * beatWidth + (seed % 7);
    points.push(
      `L${start + 24} ${baseline}`,
      `L${start + 32} ${baseline - 2}`,
      `L${start + 39} ${baseline + 2}`,
      `L${start + 47} ${baseline}`,
      `L${start + 58} ${baseline}`,
      `L${start + 64} ${baseline - peakHeight * 0.45}`,
      `L${start + 71} ${baseline + peakHeight * 0.62}`,
      `L${start + 78} ${baseline - peakHeight}`,
      `L${start + 86} ${baseline + peakHeight * 0.36}`,
      `L${start + 94} ${baseline}`,
      `L${start + 101} ${baseline - tWave}`,
      `L${start + 106} ${baseline}`,
    );
  }

  return points.join(' ');
}

export function ECGTrace({ astronautId, color, heartRate, hrv }: ECGTraceProps) {
  const path = buildECGPath(astronautId, heartRate, hrv);
  const sweepDuration = Math.max(1.35, Math.min(3.2, 180 / heartRate));

  return (
    <div
      className="ecg-strip"
      style={{ '--ecg-color': color, '--ecg-speed': `${sweepDuration}s` } as React.CSSProperties}
      aria-hidden
    >
      <svg viewBox="0 0 320 34" preserveAspectRatio="none">
        <path className="ecg-trace-base" d={path} />
        <path
          key={astronautId}
          className="ecg-trace-sweep"
          pathLength="1"
          d={path}
        />
      </svg>
      <span className="font-mono">SIM LIVE · <LiveNumber value={heartRate} /> BPM</span>
    </div>
  );
}
