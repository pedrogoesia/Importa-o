// Lightweight SVG line/area chart with a zero baseline and negative highlight.
export interface LinePoint {
  label: string;
  value: number;
}

export function LineChart({
  points,
  formatValue,
  height = 200,
}: {
  points: LinePoint[];
  formatValue?: (v: number) => string;
  height?: number;
}) {
  if (points.length === 0) return null;

  const W = 760;
  const H = height;
  const padX = 12;
  const padTop = 18;
  const padBottom = 34;
  const innerH = H - padTop - padBottom;

  const values = points.map((p) => p.value);
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;

  const n = points.length;
  const x = (i: number) => padX + (i * (W - 2 * padX)) / Math.max(n - 1, 1);
  const y = (v: number) => padTop + ((max - v) / range) * innerH;
  const zeroY = y(0);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${x(n - 1).toFixed(1)} ${zeroY.toFixed(1)} L ${x(0).toFixed(1)} ${zeroY.toFixed(1)} Z`;
  const hasNegative = min < 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* zero baseline */}
      <line
        x1={padX}
        x2={W - padX}
        y1={zeroY}
        y2={zeroY}
        stroke={hasNegative ? "#f43f5e" : "#e2e8f0"}
        strokeWidth={1}
        strokeDasharray="4 4"
      />

      <path d={areaPath} fill="url(#lc-fill)" />
      <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.value)} r={4} fill="#fff" stroke={p.value < 0 ? "#f43f5e" : "#4f46e5"} strokeWidth={2.5} />
          {formatValue && (
            <text
              x={x(i)}
              y={y(p.value) - 9}
              textAnchor="middle"
              className="fill-slate-500"
              style={{ fontSize: 10, fontWeight: 600 }}
            >
              {formatValue(p.value)}
            </text>
          )}
          <text x={x(i)} y={H - 12} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10 }}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
