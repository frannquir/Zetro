import { cn } from '@/lib/utils'

export type Point = { label: string; value: number }

const NICE_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]

function niceMax(value: number) {
  return NICE_STEPS.find((step) => step >= value) ?? Math.ceil(value / 1000) * 1000
}

export function LineChart({
  data,
  height = 200,
  className,
  ariaLabel,
}: {
  data: Point[]
  height?: number
  className?: string
  ariaLabel: string
}) {
  if (data.length === 0) return null

  const width = 720
  const pad = { top: 12, right: 8, bottom: 24, left: 32 }
  const inner = { w: width - pad.left - pad.right, h: height - pad.top - pad.bottom }
  const max = niceMax(Math.max(...data.map((d) => d.value), 1))
  const step = data.length > 1 ? inner.w / (data.length - 1) : 0

  const x = (i: number) => pad.left + i * step
  const y = (v: number) => pad.top + inner.h - (v / max) * inner.h

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ')

  const xTicks = [0, Math.floor(data.length / 2), data.length - 1].filter((v, i, a) => a.indexOf(v) === i)
  const last = data[data.length - 1]

  return (
    <div className="w-full overflow-hidden" style={{ aspectRatio: `${width} / ${height}` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={cn('w-full', className)}
        role="img"
        aria-label={ariaLabel}
        preserveAspectRatio="xMidYMid meet"
      >
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + inner.h * f}
            y2={pad.top + inner.h * f}
            stroke="var(--n-200)"
            strokeWidth="1"
          />
        ))}
        {[0, 0.5, 1].map((f) => (
          <text
            key={f}
            x={pad.left - 8}
            y={pad.top + inner.h * f}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-ink-4 tnum"
            style={{ fontSize: 11 }}
          >
            {Math.round(max * (1 - f))}
          </text>
        ))}
        <path d={line} fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <circle cx={x(data.length - 1)} cy={y(last.value)} r="3" fill="var(--brand)" stroke="var(--surface)" strokeWidth="2" />
        {xTicks.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={height - 6}
            textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
            className="fill-ink-4"
            style={{ fontSize: 11 }}
          >
            {data[i].label}
          </text>
        ))}
      </svg>
    </div>
  )
}
