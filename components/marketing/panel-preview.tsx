import { CalendarDays, LayoutDashboard, Users, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const rows = [
  { time: '20:00', name: 'Familia Gutiérrez', detail: 'Mesa 4 · 4 personas', tone: 'bg-success/12 text-success' },
  { time: '20:30', name: 'Lucía Fernández', detail: 'Mesa 2 · 2 personas', tone: 'bg-success/12 text-success' },
  { time: '21:00', name: 'Martín Paz', detail: 'Mesa 7 · 6 personas', tone: 'bg-warning/15 text-warning' },
  { time: '21:30', name: 'Sofía Ledesma', detail: 'Mesa 1 · 2 personas', tone: 'bg-success/12 text-success' },
]

export function PanelPreview({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border bg-card shadow-xl shadow-primary/5', className)} aria-hidden="true">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-destructive/40" />
        <span className="size-2.5 rounded-full bg-warning/40" />
        <span className="size-2.5 rounded-full bg-success/40" />
        <span className="ml-2 truncate text-xs text-muted-foreground">app.zetro.com/panel/bar-chelo</span>
      </div>

      <div className="flex">
        <div className="hidden w-40 shrink-0 flex-col gap-1 border-r bg-sidebar p-3 sm:flex">
          {[
            { icon: LayoutDashboard, label: 'Inicio' },
            { icon: CalendarDays, label: 'Reservas', active: true },
            { icon: Users, label: 'Clientes' },
            { icon: BarChart3, label: 'Analítica' },
          ].map((item) => (
            <span
              key={item.label}
              className={cn(
                'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium',
                item.active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground',
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </span>
          ))}
        </div>

        <div className="flex-1 space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Hoy', value: '18' },
              { label: 'Semana', value: '96' },
              { label: 'Ocupación', value: '82%' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border bg-background p-2.5">
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                <p className="text-base font-semibold tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            {rows.map((row) => (
              <div key={row.time} className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                <span className="w-10 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">{row.time}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{row.name}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">{row.detail}</span>
                </span>
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', row.tone)}>
                  {row.tone.includes('warning') ? 'Pendiente' : 'Confirmada'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
