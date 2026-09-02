import type { Metadata } from 'next'
import { Mail, UserPlus } from 'lucide-react'
import { getInvites, getMembers, getMembership } from '@/lib/data'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateLong } from '@/lib/format'
import { memberRoleLabel, memberRoleOptions } from '@/lib/labels'

export const metadata: Metadata = { title: 'Equipo — Zetro' }

export default async function EquipoPage({ params }: PageProps<'/panel/[orgSlug]/ajustes/equipo'>) {
  const { orgSlug } = await params
  const { org } = await getMembership(orgSlug)
  const [members, invites] = await Promise.all([getMembers(orgSlug), getInvites(orgSlug)])

  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-3">
        <h2 className="font-medium">Miembros</h2>
        <div className="overflow-hidden rounded-xl border bg-card">
          <ul className="divide-y">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                <StatusBadge tone="neutral">{memberRoleLabel(member.role)}</StatusBadge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 font-medium">
          <UserPlus className="size-4" /> Invitar a alguien
        </h2>
        <form className="flex flex-col gap-2 sm:flex-row">
          <Input type="email" placeholder="mail@negocio.com" className="flex-1" disabled />
          <Select defaultValue="staff" disabled>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {memberRoleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled>
            Invitar
          </Button>
        </form>

        {invites.length > 0 ? (
          <ul className="space-y-2">
            {invites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5" /> {invite.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {memberRoleLabel(invite.role)} · vence el {formatDateLong(invite.expiresAt, { timeZone: org.timeZone })}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
