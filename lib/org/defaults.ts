export type OrgSettings = {
  booking: {
    slot_minutes: number
    lead_time_minutes: number
    max_days_ahead: number
    auto_confirm: boolean
    require_phone: boolean
    max_party_size: number
  }
  modules: { menu: boolean; events: boolean; classes: boolean }
  public_widget: { primary_color: string; show_prices: boolean }
}

export const defaultSettings: OrgSettings = {
  booking: {
    slot_minutes: 30,
    lead_time_minutes: 60,
    max_days_ahead: 60,
    auto_confirm: true,
    require_phone: true,
    max_party_size: 12,
  },
  modules: { menu: true, events: true, classes: false },
  public_widget: { primary_color: '#111111', show_prices: true },
}

export const defaultTimezone = 'America/Argentina/Buenos_Aires'
export const defaultCurrency = 'ARS'

function section<T extends object>(base: T, raw: unknown): T {
  if (!raw || typeof raw !== 'object') return { ...base }
  const value = raw as Record<string, unknown>
  const merged = { ...base } as Record<string, unknown>
  for (const key of Object.keys(base)) {
    if (value[key] !== undefined && value[key] !== null) merged[key] = value[key]
  }
  return merged as T
}

export function readSettings(raw: unknown): OrgSettings {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    booking: section(defaultSettings.booking, value.booking),
    modules: section(defaultSettings.modules, value.modules),
    public_widget: section(defaultSettings.public_widget, value.public_widget),
  }
}
