import Image from 'next/image'
import { cn } from '@/lib/utils'

type SiteShotProps = {
  src: string
  alt: string
  url: string
  sizes: string
  priority?: boolean
  className?: string
}

// Captura de un sitio real dentro de una barra de navegador mínima: solo la URL,
// sin los tres puntitos de Mac (ver docs/ZETRO_FRONTEND_DESIGN.md, antipatrones).
export function SiteShot({ src, alt, url, sizes, priority, className }: SiteShotProps) {
  const host = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

  return (
    <figure className={cn('overflow-hidden rounded-md border border-n-200 bg-surface', className)}>
      <div className="flex h-9 items-center border-b border-n-200 bg-paper-2 px-3">
        <span className="mx-auto max-w-full truncate rounded-sm bg-surface px-3 py-0.5 text-xs text-ink-3">{host}</span>
      </div>
      <div className="relative aspect-[16/10] w-full bg-paper-2">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />
      </div>
    </figure>
  )
}
