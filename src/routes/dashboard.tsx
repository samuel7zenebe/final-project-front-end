import {
  createFileRoute,
  Outlet,
  useNavigate,
  Link,
} from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import Avatar from '../components/Avatar'
import {
  Loader2,
  LayoutDashboard,
  FileText,
  LogOut,
  Shield,
  MessageSquare,
  Users as UsersIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '#/lib/utils.ts'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

type NavItem = { label: string; icon: LucideIcon; to: string }

const MAIN_NAV: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'My Posts', icon: FileText, to: '/dashboard' },
  { label: 'Profile', icon: UsersIcon, to: '/profile' },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Manage Blogs', icon: Shield, to: '/dashboard/blogs' },
  { label: 'Comments', icon: MessageSquare, to: '/dashboard/comments' },
  { label: 'Users', icon: UsersIcon, to: '/dashboard/users' },
]

function NavRowLink({
  item,
  className,
}: {
  item: NavItem
  className?: string
}) {
  return (
    <Link
      to={item.to}
      activeProps={{
        className: cn('bg-primary/10 text-primary shadow-sm', className),
      }}
      inactiveProps={{
        className: cn(
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          className,
        ),
      }}
      className={cn(
        'flex items-center gap-3 font-bold transition-all',
        className,
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  )
}

function DashboardLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/login' })
    }
  }, [user, loading, navigate])

  if (loading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const adminNav = user.role === 'ADMIN' ? ADMIN_NAV : []

  return (
    <main className="page-wrap px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="hidden lg:col-span-1 lg:block">
          <div className="island-shell space-y-1 rounded-3xl border-border bg-card/50 p-3 shadow-sm backdrop-blur-sm">
            <div className="mb-6 flex flex-col items-center p-4 text-center">
              <Avatar
                src={user.avatarUrl}
                fallback={user.username}
                size="lg"
                className="mb-3 border-4 border-primary/10 shadow-lg"
              />
              <h3 className="font-bold text-foreground">{user.username}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                {user.role}
              </p>
            </div>

            <div className="mx-2 my-3 h-px bg-border" />

            <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
              Menu
            </p>
            {MAIN_NAV.map((item) => (
              <NavRowLink
                key={item.label}
                item={item}
                className="w-full rounded-2xl px-4 py-3 text-sm"
              />
            ))}

            {adminNav.length > 0 && (
              <>
                <div className="mx-2 my-3 h-px bg-border" />
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                  Administration
                </p>
                {adminNav.map((item) => (
                  <NavRowLink
                    key={item.label}
                    item={item}
                    className="w-full rounded-2xl px-4 py-3 text-sm"
                  />
                ))}
              </>
            )}

            <div className="mx-2 my-3 h-px bg-border" />
            <button
              type="button"
              onClick={() => {
                logout()
                navigate({ to: '/' })
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-destructive transition hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        <section className="min-w-0 lg:col-span-3">
          <div className="lg:hidden">
            <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[...MAIN_NAV, ...adminNav].map((item) => (
                  <NavRowLink
                    key={`rail-${item.label}`}
                    item={item}
                    className="shrink-0 whitespace-nowrap rounded-2xl border border-border bg-muted/30 px-4 py-2.5 text-xs"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate({ to: '/' })
                  }}
                  className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border border-border px-4 py-2.5 text-xs font-bold text-destructive transition hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
          <Outlet />
        </section>
      </div>
    </main>
  )
}
