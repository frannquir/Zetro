import Link from 'next/link'
import { Logo } from '@/components/marketing/logo'

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper-2">
      <header className="px-5 py-6">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2">
          <Logo className="size-7" />
          <span className="text-lg font-semibold tracking-tight text-ink">Zetro</span>
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-16">
        {children}
      </main>
    </div>
  )
}
