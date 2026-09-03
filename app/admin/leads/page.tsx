import type { Metadata } from 'next'
import { listLeads } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { Card } from '@/components/ui/card'
import { formatDateTime } from '@/lib/format'
import { leadStatusLabel, leadStatusTone } from '@/lib/labels'

export const metadata: Metadata = { title: 'Leads — Consola Zetro' }

export default async function AdminLeadsPage() {
  const leads = await listLeads()

  return (
    <>
      <PageHeader title="Leads" description="Consultas que entraron por zetro.com." />

      {leads.length === 0 ? (
        <EmptyState title="Todavía no llegó ninguna consulta" />
      ) : (
        <Card size="sm" className="overflow-hidden py-0">
          <ul className="divide-y divide-n-200">
            {leads.map((lead) => (
              <li key={lead.id} className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{lead.name}</p>
                    <p className="text-[0.8125rem] text-ink-3">
                      {lead.email}
                      {lead.phone ? ` · ${lead.phone}` : ''}
                    </p>
                  </div>
                  <StatusBadge tone={leadStatusTone(lead.status)}>{leadStatusLabel(lead.status)}</StatusBadge>
                </div>
                <p className="mt-3 text-[0.9375rem] text-ink text-pretty">{lead.message}</p>
                <p className="mt-3 text-xs text-ink-4">
                  {formatDateTime(lead.createdAt, {})} · {lead.sourcePath ?? '—'}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
