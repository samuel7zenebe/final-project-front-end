import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useBlogs, useUpdateBlogStatus, useDeleteBlog } from '../lib/api'
import {
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { Blog } from '../types'
import Avatar from '../components/Avatar'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog'
import { Textarea } from '../components/ui/textarea'
import React, { useState } from 'react'

export const Route = createFileRoute('/dashboard/blogs')({
  component: ManageBlogsPage,
})

const columnHelper = createColumnHelper<Blog>()

function ManageBlogsPage() {
  const { user } = useAuth()
  const { data: blogs, isLoading } = useBlogs()
  const updateStatus = useUpdateBlogStatus()
  const deleteBlog = useDeleteBlog()

  // State for Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null)
  const [reason, setReason] = useState('')

  const handleStatusUpdate = async (id: number, status: string, rejectedReason?: string) => {
    const promise = updateStatus.mutateAsync({
      id,
      status: status as any,
      rejectedReason,
    })

    toast.promise(promise, {
      loading: `Updating status to ${status}...`,
      success: `Blog ${status} successfully!`,
      error: 'Failed to update blog status.',
    })
  }

  const handleDelete = async (id: number) => {
    const promise = deleteBlog.mutateAsync(id)

    toast.promise(promise, {
      loading: 'Deleting blog...',
      success: 'Blog deleted successfully!',
      error: 'Failed to delete blog.',
    })
  }

  const columns = [
    columnHelper.accessor('title', {
      header: 'Title & Author',
      cell: (info) => {
        const blog = info.row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={blog.author?.avatarUrl}
              fallback={blog.author?.username}
              size="sm"
            />
            <div>
              <p className="font-bold text-foreground line-clamp-1">
                {blog.title}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {blog.author?.username || 'Unknown Author'}
              </p>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue()
        return (
          <Badge
            variant="outline"
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter border-none ${
              status === 'published'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : status === 'rejected'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}
          >
            {status}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('createdAt', {
      header: 'Submitted',
      cell: (info) => (
        <span className="text-xs text-muted-foreground">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const blog = info.row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Link
              to="/blog/$id"
              params={{ id: blog.id.toString() }}
              className="rounded-xl p-2 text-muted-foreground hover:bg-background hover:text-primary transition-all"
            >
              <Eye className="h-4 w-4" />
            </Link>
            {blog.status !== 'published' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 rounded-xl transition-all"
                onClick={() => handleStatusUpdate(blog.id, 'published')}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            {blog.status !== 'rejected' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 rounded-xl transition-all"
                onClick={() => {
                  setSelectedBlogId(blog.id)
                  setReason('')
                  setRejectDialogOpen(true)
                }}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 rounded-xl transition-all"
              onClick={() => {
                setSelectedBlogId(blog.id)
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: blogs || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="display-title mb-2 text-4xl font-bold text-foreground">
            Manage Blogs
          </h1>
          <p className="text-muted-foreground font-medium">
            Review and moderate all community contributions.
          </p>
        </div>
      </div>

      <Card className="island-shell overflow-hidden rounded-[2.5rem] border-border bg-card/50 backdrop-blur-sm shadow-xl">
        <div className="border-b border-border bg-muted/30 px-8 py-6">
          <h3 className="font-bold text-foreground">Submissions Queue</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-border bg-muted/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-8 py-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-primary/5 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-8 py-5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {blogs?.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="py-20 text-center">
                      <p className="text-muted-foreground font-medium">
                        No submissions found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-border bg-muted/10 px-8 py-4">
              <div className="text-xs text-muted-foreground font-medium">
                Showing {table.getRowModel().rows.length} of {blogs?.length}{' '}
                posts
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center gap-1 text-xs font-bold text-foreground mx-2">
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

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

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this blog post. This will be shared with the author.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px] rounded-2xl"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim()}
              onClick={() => {
                if (selectedBlogId) {
                  handleStatusUpdate(selectedBlogId, 'rejected', reason)
                  setRejectDialogOpen(false)
                }
              }}
            >
              Reject Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
