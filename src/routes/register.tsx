import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { UserPlus, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import { Button } from '#/components/ui/button.tsx'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await register(username, email, password)
      navigate({ to: '/' })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed'
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
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)]">
            Create Account
          </h1>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Join our community of readers and writers
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
              htmlFor="register-username"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Username
            </Label>
            <Input
              id="register-username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-auto rounded-2xl border-border bg-background/80 px-4 py-3 text-sm dark:bg-input/30"
              placeholder="johndoe"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="register-email"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Email Address
            </Label>
            <Input
              id="register-email"
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
              htmlFor="register-password"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Password
            </Label>
            <Input
              id="register-password"
              type="password"
              required
              autoComplete="new-password"
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
              'Create Account'
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--sea-ink-soft)]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-[var(--lagoon-deep)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
