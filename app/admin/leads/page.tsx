import type { Metadata } from 'next'
import { listLeads } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { Inbox } from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import { leadStatusLabel, leadStatusTone } from '@/lib/labels'

export const metadata: Metadata = { title: 'Leads — Consola Zetro' }

export default async function AdminLeadsPage() {
  const leads = await listLeads()

  return (
    <>
      <PageHeader title="Leads" description="Consultas que entraron por zetro.com." />

      {leads.length === 0 ? (
        <EmptyState icon={Inbox} title="Todavía no llegó ninguna consulta" />
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => (
            <li key={lead.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lead.email}
                    {lead.phone ? ` · ${lead.phone}` : ''}
                  </p>
                </div>
                <StatusBadge tone={leadStatusTone(lead.status)}>{leadStatusLabel(lead.status)}</StatusBadge>
              </div>
              <p className="mt-3 text-sm text-pretty">{lead.message}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatDateTime(lead.createdAt, {})} · {lead.sourcePath ?? '—'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
