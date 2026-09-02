import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zetro',
  description: 'Sitios web y panel de gestión para negocios',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
