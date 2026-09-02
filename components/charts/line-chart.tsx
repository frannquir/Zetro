import { cn } from '@/lib/utils'

export type Point = { label: string; value: number }

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
  const pad = { top: 12, right: 8, bottom: 24, left: 8 }
  const inner = { w: width - pad.left - pad.right, h: height - pad.top - pad.bottom }
  const max = Math.max(...data.map((d) => d.value), 1)
  const step = data.length > 1 ? inner.w / (data.length - 1) : 0

  const x = (i: number) => pad.left + i * step
  const y = (v: number) => pad.top + inner.h - (v / max) * inner.h

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ')
  const area = `${line} L${x(data.length - 1).toFixed(1)},${(pad.top + inner.h).toFixed(1)} L${pad.left},${(pad.top + inner.h).toFixed(1)} Z`

  const ticks = [0, Math.floor(data.length / 2), data.length - 1].filter((v, i, a) => a.indexOf(v) === i)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('w-full', className)}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((f) => (
        <line
          key={f}
          x1={pad.left}
          x2={width - pad.right}
          y1={pad.top + inner.h * f}
          y2={pad.top + inner.h * f}
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#line-fill)" />
      <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {ticks.map((i) => (
        <text
          key={i}
          x={x(i)}
          y={height - 6}
          textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
          className="fill-muted-foreground"
          style={{ fontSize: 11 }}
        >
          {data[i].label}
        </text>
      ))}
    </svg>
  )
}
