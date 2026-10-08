import { ImageResponse } from 'next/og'

export const alt = 'Zetro: el sitio de tu negocio, y el panel para manejarlo'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Satori no lee oklch: son los tokens de globals.css (paper, ink, ink-3, brand) pasados a hex
const paper = '#fbf9f5'
const ink = '#1d1a16'
const ink3 = '#6a645c'
const brand = '#b4552d'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: paper,
        color: ink,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            background: ink,
            color: paper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          Z
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>Zetro</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2.5, maxWidth: 940 }}>
          El sitio de tu negocio, y el panel para manejarlo.
        </div>
        <div style={{ fontSize: 30, color: ink3 }}>Reservas online, tu carta al día y los números que importan.</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, color: ink3 }}>
        <div style={{ width: 40, height: 6, borderRadius: 3, background: brand }} />
        Desde US$ 60 · Respondemos en el día hábil
      </div>
    </div>,
    size,
  )
}
