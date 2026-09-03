const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ChecklistDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" className={className} aria-hidden="true">
      <rect x="30" y="18" width="160" height="184" rx="4" className="text-n-300" {...strokeProps} />
      <path d="M30 46h160" className="text-n-300" {...strokeProps} />
      {[70, 104, 138, 172].map((y, i) => (
        <g key={y}>
          <rect x="46" y={y - 8} width="16" height="16" rx="3" className="text-ink-3" {...strokeProps} />
          {i < 3 ? <path d={`M50 ${y}l4 4 8-8`} className="text-brand" {...strokeProps} /> : null}
          <path d={`M74 ${y}h96`} className={i < 3 ? 'text-n-300' : 'text-ink-3'} {...strokeProps} />
        </g>
      ))}
    </svg>
  )
}

export function PathDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 90" className={className} aria-hidden="true">
      <path d="M20 45h440" className="text-n-300" {...strokeProps} />
      {[20, 160, 300, 440].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy="45"
          r="9"
          className={i === 0 ? 'text-brand' : 'text-n-400'}
          fill={i === 0 ? 'currentColor' : 'var(--paper)'}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}
