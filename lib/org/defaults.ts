export type OrgSettings = {
  booking: {
    slot_minutes: number
    lead_time_minutes: number
    max_days_ahead: number
    auto_confirm: boolean
    require_phone: boolean
    max_party_size: number
  }
  modules: {
    menu: boolean
    events: boolean
    classes: boolean
  }
  public_widget: {
    primary_color: string
    show_prices: boolean
  }
}

export const defaultTimezone = 'America/Argentina/Buenos_Aires'
export const defaultCurrency = 'ARS'

// mirrors private.default_org_settings()
export const defaultSettings: OrgSettings = {
  booking: {
    slot_minutes: 30,
    lead_time_minutes: 60,
    max_days_ahead: 60,
    auto_confirm: true,
    require_phone: true,
    max_party_size: 12,
  },
  modules: {
    menu: true,
    events: true,
    classes: false,
  },
  public_widget: {
    primary_color: '#111111',
    show_prices: true,
  },
}

function group<K extends keyof OrgSettings>(settings: unknown, key: K): OrgSettings[K] {
  const value = settings && typeof settings === 'object' ? (settings as Record<string, unknown>)[key] : null
  if (!value || typeof value !== 'object') return defaultSettings[key]
  return { ...defaultSettings[key], ...(value as object) } as OrgSettings[K]
}

export function readSettings(settings: unknown): OrgSettings {
  return {
    booking: group(settings, 'booking'),
    modules: group(settings, 'modules'),
    public_widget: group(settings, 'public_widget'),
  }
}
