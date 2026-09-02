import type { Metadata } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: 'Zetro',
  description: 'Sitios web y panel de gestión para negocios',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  )
}
