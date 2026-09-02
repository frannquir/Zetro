import type { Metadata } from 'next'
import { getMembership } from '@/lib/data'
import { SettingsField } from '@/components/settings/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { verticalOptions } from '@/lib/labels'

export const metadata: Metadata = { title: 'Ajustes generales — Zetro' }

const timezones = [
  'America/Argentina/Buenos_Aires',
  'America/Argentina/Cordoba',
  'America/Montevideo',
  'America/Santiago',
]

export default async function AjustesGeneralPage({ params }: PageProps<'/panel/[orgSlug]/ajustes'>) {
  const { orgSlug } = await params
  const { org, role } = await getMembership(orgSlug)
  const readOnly = role === 'staff'

  return (
    <form className="max-w-2xl space-y-6">
      <section className="space-y-5">
        <h2 className="font-medium">Datos del negocio</h2>
        <SettingsField id="name" label="Nombre">
          <Input id="name" defaultValue={org.name} disabled={readOnly} />
        </SettingsField>
        <SettingsField id="phone" label="Teléfono">
          <Input id="phone" defaultValue={org.phone ?? ''} disabled={readOnly} />
        </SettingsField>
        <SettingsField id="whatsapp" label="WhatsApp" hint="Con código de país, sin espacios ni signos">
          <Input id="whatsapp" defaultValue={org.whatsapp ?? ''} disabled={readOnly} />
        </SettingsField>
        <SettingsField id="address" label="Dirección">
          <Textarea id="address" defaultValue={org.address ?? ''} rows={2} disabled={readOnly} />
        </SettingsField>
      </section>

      <Separator />

      <section className="space-y-5">
        <h2 className="font-medium">Configuración</h2>
        <SettingsField id="vertical" label="Rubro" hint="Define el vocabulario del panel">
          <Select defaultValue={org.vertical} disabled>
            <SelectTrigger id="vertical" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {verticalOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>
        <SettingsField id="timezone" label="Zona horaria">
          <Select defaultValue={org.timeZone} disabled={readOnly}>
            <SelectTrigger id="timezone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>
      </section>

      {!readOnly ? (
        <Button type="submit" disabled>
          Guardar cambios
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">Tu rol solo puede ver esta sección.</p>
      )}
    </form>
  )
}
