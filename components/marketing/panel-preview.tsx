import { CalendarDays, LayoutDashboard, Users, BarChart3 } from 'lucide-react'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { cn } from '@/lib/utils'

const rows = [
  { time: '20:00', name: 'Familia Gutiérrez', detail: 'Mesa 4 · 4 personas', tone: 'positive' as const },
  { time: '20:30', name: 'Lucía Fernández', detail: 'Mesa 2 · 2 personas', tone: 'positive' as const },
  { time: '21:00', name: 'Martín Paz', detail: 'Mesa 7 · 6 personas', tone: 'warning' as const },
  { time: '21:30', name: 'Sofía Ledesma', detail: 'Mesa 1 · 2 personas', tone: 'positive' as const },
]

export function PanelPreview({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-none border border-n-300 bg-surface', className)} aria-hidden="true">
      <div className="flex h-8 items-center border-b border-n-200 bg-paper-2 px-4">
        <span className="truncate font-mono text-[0.6875rem] text-ink-4">app.zetro.app/panel/bar-chelo</span>
      </div>

      <div className="flex">
        <div className="hidden w-40 shrink-0 flex-col gap-1 border-r border-n-200 bg-paper-2 p-3 sm:flex">
          {[
            { icon: LayoutDashboard, label: 'Inicio' },
            { icon: CalendarDays, label: 'Reservas', active: true },
            { icon: Users, label: 'Clientes' },
            { icon: BarChart3, label: 'Analítica' },
          ].map((item) => (
            <span
              key={item.label}
              className={cn(
                'relative flex items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-medium',
                item.active
                  ? 'bg-surface text-ink before:absolute before:inset-y-1.5 before:-left-1.5 before:w-[3px] before:rounded-r-sm before:bg-brand before:content-[""]'
                  : 'text-ink-3',
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </span>
          ))}
        </div>

        <div className="flex-1 space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            <StatCard inline label="Hoy" value="18" />
            <StatCard inline label="Semana" value="96" />
            <StatCard inline label="Ocupación" value="82%" />
          </div>

          <div className="divide-y divide-n-200 rounded-sm border border-n-200">
            {rows.map((row) => (
              <div key={row.time} className="flex items-center gap-3 px-3 py-2">
                <span className="w-10 shrink-0 text-xs font-medium tnum text-ink">{row.time}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-ink">{row.name}</span>
                  <span className="block truncate text-[0.6875rem] text-ink-3">{row.detail}</span>
                </span>
                <span className="shrink-0 text-[0.6875rem]">
                  <StatusBadge tone={row.tone}>{row.tone === 'warning' ? 'Pendiente' : 'Confirmada'}</StatusBadge>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
