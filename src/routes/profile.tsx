import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import { useAuth } from '#/hooks/useAuth'
import { toast } from 'sonner'
import {
  useUpdateMe,
  useUploadProfilePicture,
  useChangePassword,
} from '#/lib/api'
import Avatar from '#/components/Avatar'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Loader2,
  Upload,
  Save,
  User as UserIcon,
  Mail,
  Camera,
  ShieldCheck,
} from 'lucide-react'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth()
  const updateMe = useUpdateMe()
  const uploadAvatar = useUploadProfilePicture()

  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setAvatarUrl(user.avatarUrl || '')
    }
  }, [user])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const res = await uploadAvatar.mutateAsync(file)
      if (res.url) {
        setAvatarUrl(res.url)
        // Auto-save the avatar URL
        const updateRes = await updateMe.mutateAsync({ avatarUrl: res.url })
        updateUser(updateRes.user || updateRes)
      }
    } catch (err) {
      console.error('Avatar upload failed', err)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await updateMe.mutateAsync({ username, avatarUrl })
      updateUser(res)
      toast.success('Profile updated successfully')
    } catch (err) {
      console.error('Profile update failed', err)
      toast.error('Profile update failed')
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="page-wrap px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <Avatar
              src={avatarUrl}
              fallback={username}
              size="lg"
              className="h-40 w-40 border-8 border-background shadow-2xl"
            />
            <label
              htmlFor="profile-avatar-upload"
              className="absolute bottom-2 right-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-110 active:scale-95"
            >
              {uploadAvatar.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
              <input
                id="profile-avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadAvatar.isPending}
              />
            </label>
          </div>
          <h1 className="display-title text-4xl font-extrabold text-foreground">
            {username}
          </h1>
          <p className="mt-2 text-muted-foreground font-medium">
            {user?.email}
          </p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              {user?.role}
            </span>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 px-10 py-8 border-b border-border">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <UserIcon className="h-6 w-6 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <Label
                    htmlFor="username"
                    className="text-sm font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Display Name
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground opacity-50" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-border bg-background/50 focus:ring-primary/20"
                      placeholder="Your public name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-sm font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground opacity-50" />
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="pl-12 h-14 rounded-2xl bg-muted/30 border-border cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground max-w-sm">
                  This information will be displayed on your public profile and
                  blog posts.
                </p>
                <Button
                  type="submit"
                  disabled={
                    updateMe.isPending ||
                    (username === user?.username &&
                      avatarUrl === (user?.avatarUrl || ''))
                  }
                  className="rounded-2xl px-10 h-14 font-bold shadow-xl shadow-primary/20 transition hover:translate-y-[-2px]"
                >
                  {updateMe.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-12 rounded-[2.5rem] border-border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/30 px-10 py-8 border-b border-border">
            <CardTitle className="text-xl font-bold flex items-center gap-3 text-rose-500">
              <ShieldCheck className="h-6 w-6" />
              Security & Password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function PasswordChangeForm() {
  const changePassword = useChangePassword()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    try {
      await changePassword.mutateAsync({ oldPassword, newPassword })
      setMessage({ type: 'success', text: 'Password updated successfully' })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to update password',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Current Password
          </Label>
          <Input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="h-12 rounded-xl border-border"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            New Password
          </Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-12 rounded-xl border-border"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Confirm New Password
          </Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 rounded-xl border-border"
          />
        </div>
      </div>

      {message.text && (
        <div
          className={`text-sm font-bold ${message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={changePassword.isPending || !newPassword}
          variant="secondary"
          className="rounded-xl px-8 h-12 font-bold transition hover:bg-rose-500 hover:text-white"
        >
          {changePassword.isPending && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          Update Password
        </Button>
      </div>
    </form>
  )
}
