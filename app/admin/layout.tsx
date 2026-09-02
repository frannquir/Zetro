import { getViewer } from '@/lib/data'
import { adminNav } from '@/lib/nav'
import { AdminNav } from '@/components/admin/admin-nav'
import { UserMenu } from '@/components/panel/user-menu'
import { Logo } from '@/components/marketing/logo'

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const viewer = await getViewer()

  return (
    <div className="flex min-h-dvh bg-muted/30">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r bg-sidebar px-4 py-5 lg:flex">
        <div className="flex items-center gap-2 px-1">
          <Logo className="size-6" />
          <span className="text-sm font-semibold tracking-tight">Consola Zetro</span>
        </div>
        <AdminNav items={adminNav} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <span className="font-medium lg:hidden">Consola Zetro</span>
          <div className="ml-auto">
            <UserMenu fullName={viewer.fullName} email={viewer.email} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
