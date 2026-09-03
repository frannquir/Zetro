export function PausedBanner({ status }: { status: string }) {
  if (status !== 'paused') return null

  return (
    <div className="rounded-sm border-l-[3px] border-l-warn bg-warn-soft px-4 py-3 text-[0.9375rem] text-ink">
      <p className="font-medium">Tu cuenta está pausada</p>
      <p className="text-ink-3">
        Podés entrar, pero los datos no se están actualizando. Escribinos a hola@zetro.com para reactivarla.
      </p>
    </div>
  )
}
