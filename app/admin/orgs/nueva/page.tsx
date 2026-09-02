import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { SettingsField } from '@/components/settings/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { verticalOptions } from '@/lib/labels'

export const metadata: Metadata = { title: 'Nuevo cliente — Consola Zetro' }

export default function NuevoClientePage() {
  return (
    <>
      <PageHeader title="Nuevo cliente" description="Crea el negocio y manda la invitación al dueño." />

      <form className="max-w-xl space-y-5 rounded-md border border-n-200 bg-surface p-6">
        <SettingsField id="name" label="Nombre del negocio">
          <Input id="name" placeholder="Bar Chelo" required />
        </SettingsField>
        <SettingsField id="slug" label="Slug" hint="Va en la url: /panel/slug">
          <Input id="slug" placeholder="bar-chelo" required />
        </SettingsField>
        <SettingsField id="vertical" label="Rubro">
          <Select required>
            <SelectTrigger id="vertical" className="w-full">
              <SelectValue placeholder="Elegí un rubro" />
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
        <SettingsField id="owner_email" label="Mail del dueño" hint="Le llega la invitación">
          <Input id="owner_email" type="email" placeholder="dueño@negocio.com" required />
        </SettingsField>

        <Button type="submit" disabled className="w-full sm:w-auto">
          Crear negocio
        </Button>
      </form>
    </>
  )
}
