import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LogIn, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import { Button } from '#/components/ui/button.tsx'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate({ to: '/' })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid email or password'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-wrap flex min-h-[80vh] items-center justify-center px-4">
      <div className="island-shell w-full max-w-md rounded-[2.5rem] p-8 sm:p-12">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)]">
            Welcome Back
          </h1>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="login-email"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Email Address
            </Label>
            <Input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-auto rounded-2xl border-border bg-background/80 px-4 py-3 text-sm dark:bg-input/30"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="login-password"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Password
            </Label>
            <Input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-auto rounded-2xl border-border bg-background/80 px-4 py-3 text-sm dark:bg-input/30"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto w-full rounded-2xl py-6 text-sm font-bold"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--sea-ink-soft)]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-[var(--lagoon-deep)] hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}
