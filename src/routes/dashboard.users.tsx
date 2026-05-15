import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useUsers, useDeleteUser } from '../lib/api'
import {
  Loader2,
  Trash2,
  AlertCircle,
  ShieldCheck,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog'
import React, { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import Avatar from '../components/Avatar'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'

export const Route = createFileRoute('/dashboard/users')({
  component: ManageUsersPage,
})

const columnHelper = createColumnHelper<any>()

function ManageUsersPage() {
  const { user: currentUser } = useAuth()
  const { data: users, isLoading } = useUsers()
  const deleteUser = useDeleteUser()

  // State for Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    const promise = deleteUser.mutateAsync(id)

    toast.promise(promise, {
      loading: 'Deleting user...',
      success: 'User deleted successfully!',
      error: 'Failed to delete user.',
    })
  }

  const columns = [
    columnHelper.accessor('username', {
      header: 'User Details',
      cell: (info) => {
        const u = info.row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar src={u.avatarUrl} fallback={u.username} size="sm" />
            <div>
              <p className="font-bold text-foreground">{u.username}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => {
        const role = info.getValue()
        return (
          <Badge
            variant="outline"
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border-none ${
              role === 'ADMIN'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1">
              {role === 'ADMIN' ? (
                <ShieldCheck className="h-3 w-3" />
              ) : (
                <UserIcon className="h-3 w-3" />
              )}
              {role}
            </div>
          </Badge>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const u = info.row.original
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              disabled={u.id === currentUser?.id}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 rounded-xl disabled:opacity-30 transition-all"
              onClick={() => {
                setSelectedUserId(u.id)
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
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (currentUser?.role !== 'ADMIN') {
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
      <div>
        <h1 className="display-title mb-2 text-4xl font-bold text-foreground">
          Manage Users
        </h1>
        <p className="text-muted-foreground font-medium">
          Control user accounts and system permissions.
        </p>
      </div>

      <Card className="island-shell overflow-hidden rounded-[2.5rem] border-border bg-card/50 backdrop-blur-sm shadow-xl">
        <div className="border-b border-border bg-muted/30 px-8 py-6">
          <h3 className="font-bold text-foreground">Platform Users</h3>
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
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-border bg-muted/10 px-8 py-4">
              <div className="text-xs text-muted-foreground font-medium">
                Showing {table.getRowModel().rows.length} of {users?.length}{' '}
                users
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
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? All their blogs and comments will be permanently removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUserId) {
                  handleDelete(selectedUserId)
                  setDeleteDialogOpen(false)
                }
              }}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
