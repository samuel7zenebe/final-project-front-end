import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '#/hooks/useAuth'
import { Plus, Loader2, Eye, Edit, Trash2 } from 'lucide-react'
import { useBlogs, useDeleteBlog } from '#/lib/api'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import React, { useState } from 'react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndexPage,
})

function DashboardIndexPage() {
  const { user } = useAuth()
  const { data: blogs, isLoading: blogsLoading } = useBlogs()
  const deleteBlog = useDeleteBlog()

  // State for Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null)

  // Filter blogs by author (authorId === user.id)
  const userBlogs = blogs?.filter((b) => b.authorId === user?.id) || []

  const handleDelete = async (id: number) => {
    const promise = deleteBlog.mutateAsync(id)

    toast.promise(promise, {
      loading: 'Deleting blog...',
      success: 'Blog deleted successfully!',
      error: 'Failed to delete blog.',
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="display-title mb-2 text-4xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground font-medium">
            Welcome back, {user?.username}. Manage your content here.
          </p>
        </div>
        <Link
          to="/dashboard/new"
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-95 shadow-xl shadow-primary/20"
        >
          <Plus className="h-5 w-5" />
          Create New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Total Posts',
            value: userBlogs.length,
            className: 'text-primary',
          },
          {
            label: 'Total Reads',
            value: userBlogs.reduce((acc, b) => acc + (b.readCount || 0), 0),
            className: 'text-orange-500', // Accent-like color for sunset theme
          },
          { label: 'Comments', value: '0', className: 'text-foreground' },
        ].map((stat) => (
          <div key={stat.label} className="island-shell rounded-3xl p-6 bg-card/50 backdrop-blur-sm border-border shadow-sm">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p
              className={`text-3xl font-extrabold ${stat.className}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Posts Table */}
      <div className="island-shell overflow-hidden rounded-3xl border-border bg-card/50 backdrop-blur-sm shadow-xl">
        <div className="border-b border-border bg-muted/30 px-8 py-6">
          <h3 className="font-bold text-foreground">Recent Posts</h3>
        </div>

        {blogsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : userBlogs.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground font-medium">
              You haven't written any posts yet.
            </p>
            <button className="mt-4 text-sm font-bold text-primary hover:underline">
              Start writing
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-8 py-4">Title</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Reads</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {userBlogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="group hover:bg-primary/5 transition"
                  >
                    <td className="px-8 py-5">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {blog.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-tighter shadow-sm ${
                          blog.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-medium text-muted-foreground">
                      {blog.readCount}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to="/blog/$id"
                          params={{ id: blog.id.toString() }}
                          className="rounded-xl p-2 text-muted-foreground hover:bg-background hover:text-primary transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button className="rounded-xl p-2 text-muted-foreground hover:bg-background hover:text-primary transition-all">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBlogId(blog.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="rounded-xl p-2 text-muted-foreground hover:bg-background hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedBlogId) {
                  handleDelete(selectedBlogId)
                  setDeleteDialogOpen(false)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
