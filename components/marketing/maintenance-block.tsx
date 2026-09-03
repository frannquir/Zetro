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
    <div className="rounded-md border border-n-200 bg-surface p-6 sm:p-8">
      <h3 className="text-lg font-medium text-ink">Mantenimiento: qué incluye y qué no</h3>
      <p className="mt-2 text-xl leading-[1.3] tracking-[-0.01em] font-medium text-balance text-ink sm:text-2xl">
        Mantener es reparar y sostener lo que ya está funcionando. No es agregar cosas nuevas.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="order-1 space-y-3">
          <p className="text-[0.8125rem] font-medium text-ok">Sí está incluido</p>
          <ul className="space-y-2.5 text-[0.9375rem]">
            {included.map((item) => (
              <li key={item} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-ok" />
                <span className="text-ink-2">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-2 space-y-3">
          <p className="text-[0.8125rem] font-medium text-ink-3">Se cotiza aparte</p>
          <ul className="space-y-2.5 text-[0.9375rem]">
            {separate.map((item) => (
              <li key={item} className="flex gap-2.5">
                <Plus className="mt-0.5 size-4 shrink-0 text-ink-4" />
                <span className="text-ink-2">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 border-t border-n-200 pt-5 text-[0.9375rem] text-ink-2 text-pretty">
        Si querés sumar algo nuevo, te pasamos el presupuesto antes de hacerlo. Nunca te vamos a facturar algo que no
        aprobaste.
      </p>
    </div>
  )
}
