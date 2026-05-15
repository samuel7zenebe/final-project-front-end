import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useBlogs, useDeleteComment, useApproveComment } from '../lib/api'
import {
  Loader2,
  Trash2,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
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
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog'
import React, { useState } from 'react'

export const Route = createFileRoute('/dashboard/comments')({
  component: ManageCommentsPage,
})

const columnHelper = createColumnHelper<any>()

function ManageCommentsPage() {
  const { user } = useAuth()
  const { data: blogs, isLoading: blogsLoading } = useBlogs()
  const deleteComment = useDeleteComment()
  const approveComment = useApproveComment()

  // State for Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)

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

  // Flatten all comments from all blogs
  const allComments =
    blogs?.flatMap((blog) =>
      ((blog as any).comments || []).map((comment: any) => ({
        ...comment,
        blogTitle: blog.title,
        blogId: blog.id,
      })),
    ) || []

  const handleDelete = async (id: number) => {
    const promise = deleteComment.mutateAsync(id)

    toast.promise(promise, {
      loading: 'Deleting comment...',
      success: 'Comment deleted successfully!',
      error: 'Failed to delete comment.',
    })
  }

  const handleApprove = async (id: number) => {
    const promise = approveComment.mutateAsync(id)

    toast.promise(promise, {
      loading: 'Approving comment...',
      success: 'Comment approved successfully!',
      error: 'Failed to approve comment.',
    })
  }

  const columns = [
    columnHelper.accessor('content', {
      header: 'Comment & Author',
      cell: (info) => {
        const comment = info.row.original
        return (
          <div className="max-w-md">
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {comment.content}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
              By {comment.authorName} ({comment.authorEmail})
            </p>
          </div>
        )
      },
    }),
    columnHelper.accessor('blogTitle', {
      header: 'On Post',
      cell: (info) => (
        <p className="text-xs font-bold text-primary truncate max-w-[150px]">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor('isApproved', {
      header: 'Status',
      cell: (info) => (
        <Badge
          variant={info.getValue() ? 'default' : 'outline'}
          className={
            info.getValue()
              ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter'
              : 'bg-amber-500/10 text-amber-600 border-none rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter'
          }
        >
          {info.getValue() ? 'Approved' : 'Pending'}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const comment = info.row.original
        return (
          <div className="flex justify-end gap-2">
            {!comment.isApproved && (
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 rounded-xl transition-all"
                onClick={() => {
                  setSelectedCommentId(comment.id)
                  setApproveDialogOpen(true)
                }}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 rounded-xl transition-all"
              onClick={() => {
                setSelectedCommentId(comment.id)
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
    data: allComments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-title mb-2 text-4xl font-bold text-foreground">
          Manage Comments
        </h1>
        <p className="text-muted-foreground font-medium">
          Moderate discussions and ensure a healthy community environment.
        </p>
      </div>

      <Card className="island-shell overflow-hidden rounded-[2.5rem] border-border bg-card/50 backdrop-blur-sm shadow-xl">
        <div className="border-b border-border bg-muted/30 px-8 py-6">
          <h3 className="font-bold text-foreground">Recent Comments</h3>
        </div>

        {blogsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : allComments.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              No comments found.
            </p>
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
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-border bg-muted/10 px-8 py-4">
              <div className="text-xs text-muted-foreground font-medium">
                Showing {table.getRowModel().rows.length} of{' '}
                {allComments.length} comments
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
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedCommentId) {
                  handleDelete(selectedCommentId)
                  setDeleteDialogOpen(false)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Approve Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this comment? It will become visible on the blog post.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                if (selectedCommentId) {
                  handleApprove(selectedCommentId)
                  setApproveDialogOpen(false)
                }
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
