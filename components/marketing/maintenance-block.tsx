import { Check, Plus } from 'lucide-react'

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
    <div className="rounded-md border border-n-200 bg-surface p-5 sm:p-6">
      <div className="md:flex md:items-start md:justify-between md:gap-6">
        <div className="md:max-w-xs">
          <h3 className="text-lg font-medium text-ink">Mantenimiento: qué incluye y qué no</h3>
          <p className="mt-1.5 text-[0.9375rem] leading-[1.4] text-ink-2 text-pretty">
            Mantener es reparar y sostener lo que ya está funcionando. No es agregar cosas nuevas.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:mt-0 md:gap-6">
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
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
      </div>

      <p className="mt-4 border-t border-n-200 pt-3 text-[0.8125rem] text-ink-3 text-pretty">
        Si querés sumar algo nuevo, te pasamos el presupuesto antes de hacerlo. Nunca te vamos a facturar algo que no
        aprobaste.
      </p>
    </div>
  )
}
