import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import Avatar from './Avatar'
import { useAuth } from '../hooks/useAuth'
import { LogIn, UserPlus, LogOut, Menu, X } from 'lucide-react'
import { useUser } from '#/lib/api'

export default function Header() {
  const { user: userDetails, logout } = useAuth()
  const { data: user } = useUser(userDetails?.id || 0)
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileNavOpen])

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <nav className="page-wrap flex items-center justify-between px-4 py-3 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-8">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground transition hover:bg-muted sm:hidden"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-primary-nav"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileNavOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <h2 className="m-0 min-w-0 shrink-0 text-base font-semibold tracking-tight">
            <Link
              to="/"
              className="inline-flex max-w-full items-center gap-2 truncate rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground no-underline shadow-sm transition-all hover:bg-muted sm:px-4 sm:py-2"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              BlogMaster
            </Link>
          </h2>

          <div className="hidden items-center gap-6 text-sm font-semibold sm:flex">
            <Link
              to="/"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-muted sm:pr-3"
              >
                <Avatar
                  src={user.avatarUrl}
                  fallback={user.username}
                  size="sm"
                  className="border-2 border-primary/20"
                />
                <span className="hidden max-w-[8rem] truncate text-xs font-bold text-foreground sm:block">
                  {user.username}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-2 py-1.5 text-xs font-bold text-foreground transition hover:bg-secondary hover:text-destructive sm:px-3"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-accent-foreground sm:gap-2 sm:px-3"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-2 py-1.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90 sm:gap-2 sm:px-3"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Register</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {mobileNavOpen && (
        <div
          id="mobile-primary-nav"
          className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur-md sm:hidden"
        >
          <div className="page-wrap flex flex-col gap-1">
            <Link
              to="/"
              className="nav-link rounded-xl px-3 py-3 text-base font-semibold"
              activeProps={{
                className:
                  'nav-link is-active rounded-xl px-3 py-3 text-base font-semibold',
              }}
              onClick={() => setMobileNavOpen(false)}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="nav-link rounded-xl px-3 py-3 text-base font-semibold"
                activeProps={{
                  className:
                    'nav-link is-active rounded-xl px-3 py-3 text-base font-semibold',
                }}
                onClick={() => setMobileNavOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
