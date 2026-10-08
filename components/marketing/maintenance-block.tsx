import { Check, ChevronDown, Plus } from 'lucide-react'

const included = [
  'Que el sitio siga online',
  'Backups',
  'Actualizaciones de seguridad y de la plataforma',
  'Arreglo de errores y cosas que dejan de funcionar',
  'Cambios chicos de textos, precios o fotos',
  'Revisión de que se siga viendo bien en celulares y navegadores nuevos',
  'Soporte por el canal acordado',
]

const separate = [
  'Secciones o páginas nuevas',
  'Funcionalidades nuevas (turnos, tienda, panel)',
  'Rediseños',
  'Integraciones con otros sistemas',
  'Migraciones',
  'Producción de contenido (textos, fotos, video)',
]

export function MaintenanceBlock() {
  return (
    <details className="group rounded-md border border-n-200 bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:px-6 [&::-webkit-details-marker]:hidden">
        <div>
          <h3 className="text-lg font-medium text-ink">Mantenimiento: qué incluye y qué no</h3>
          <p className="mt-1 text-[0.9375rem] text-ink-3 text-pretty">
            Mantener es sostener lo que ya funciona, no agregar cosas nuevas.
          </p>
        </div>
        <ChevronDown className="size-5 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="border-t border-n-200 p-5 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
          <div className="space-y-2">
            <p className="text-[0.8125rem] font-medium text-ok">Sí está incluido</p>
            <ul className="space-y-1.5 text-[0.875rem]">
              {included.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-ok" />
                  <span className="text-ink-2">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-[0.8125rem] font-medium text-ink-3">Se cotiza aparte</p>
            <ul className="space-y-1.5 text-[0.875rem]">
              {separate.map((item) => (
                <li key={item} className="flex gap-2">
                  <Plus className="mt-0.5 size-3.5 shrink-0 text-ink-4" />
                  <span className="text-ink-2">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-5 border-t border-n-200 pt-3 text-[0.8125rem] text-ink-3 text-pretty">
          Si querés sumar algo nuevo, te pasamos el presupuesto antes de hacerlo. Nunca te vamos a facturar algo que no
          aprobaste.
        </p>
      </div>
    </details>
  )
}
