import { createFileRoute, Link } from '@tanstack/react-router'
import { useBlog, useComments, usePostComment, useUser } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import React, { useState } from 'react'
import Avatar from '../components/Avatar'
import {
  Calendar,
  User,
  MessageCircle,
  Send,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/blog/$id')({
  component: BlogDetailPage,
})

function BlogDetailSkeleton() {
  return (
    <main className="page-wrap px-4 py-12">
      <div className="mb-8 h-5 w-36 max-w-[45%] animate-pulse rounded-md bg-muted" />
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </div>
      <div className="mb-10 space-y-4">
        <div className="h-12 w-full max-w-3xl animate-pulse rounded-xl bg-muted sm:h-16" />
        <div className="h-12 w-4/5 max-w-2xl animate-pulse rounded-xl bg-muted sm:h-16" />
      </div>
      <div className="mb-12 flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mb-12 h-[220px] w-full animate-pulse rounded-[2rem] bg-muted sm:h-[420px]" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted/90" />
        <div className="h-4 w-[96%] animate-pulse rounded bg-muted/90" />
        <div className="h-4 w-[88%] animate-pulse rounded bg-muted/90" />
        <div className="h-4 w-full animate-pulse rounded bg-muted/90" />
        <div className="h-4 w-[72%] animate-pulse rounded bg-muted/90" />
        <div className="h-4 w-[94%] animate-pulse rounded bg-muted/90" />
        <div className="h-4 w-full animate-pulse rounded bg-muted/90" />
        <div className="h-4 w-[84%] animate-pulse rounded bg-muted/90" />
      </div>
    </main>
  )
}

function BlogDetailPage() {
  const { id } = Route.useParams()
  const { data: blog, isLoading, error } = useBlog(id)
  const { data: comments, isLoading: isCommentsLoading } = useComments(
    Number(id),
  )
  const { user: userDetails } = useAuth()
  const { data: user } = useUser(userDetails?.id ?? '')
  const [commentContent, setCommentContent] = useState('')
  const postComment = usePostComment()

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim() || !user) return

    const promise = postComment.mutateAsync({
      content: commentContent,
      blogId: Number(id),
      authorName: user.username,
      authorEmail: user.email,
    })

    toast.promise(promise, {
      loading: 'Posting comment...',
      success: 'Comment submitted for approval!',
      error: 'Failed to post comment.',
    })

    try {
      await promise
      setCommentContent('')
    } catch (err) {
      console.error('Failed to post comment', err)
    }
  }

  const displayedComments =
    user?.role === 'ADMIN' ? comments : comments?.filter((c) => c.isApproved)

  if (isLoading) {
    return <BlogDetailSkeleton />
  }

  if (error || !blog) {
    return (
      <main className="page-wrap py-20 text-center">
        <h1 className="display-title mb-4 text-3xl font-bold text-destructive">
          Post Not Found
        </h1>
        <p className="mb-8 text-[var(--sea-ink-soft)]">
          The blog post you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/"
          className="text-sm font-bold text-[var(--lagoon-deep)] hover:underline"
        >
          Back to Home
        </Link>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 py-12">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--sea-ink-soft)] hover:text-[var(--lagoon-deep)] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Feed
      </Link>

      <article className="rise-in">
        <header className="mb-12">
          <div className="mb-6 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[var(--lagoon-deep)]">
            <span className="rounded-full bg-[var(--lagoon)]/10 px-3 py-1">
              {blog.category?.name || 'Uncategorized'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(blog.createdAt).toLocaleDateString(undefined, {
                dateStyle: 'long',
              })}
            </span>
          </div>

          <h1 className="display-title mb-8 text-4xl font-extrabold leading-[1.1] text-[var(--sea-ink)] sm:text-6xl">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4">
            <Avatar
              src={user?.avatarUrl ?? ''}
              fallback={user?.username ?? ''}
              size="lg"
              className="border-4 border-primary/10 shadow-md"
            />
            <div>
              <p className="text-sm font-bold text-foreground">
                {user?.username || 'Author'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role || 'Contributor'}
              </p>
            </div>
          </div>
        </header>

        {blog.coverImageUrl && (
          <div className="mb-12 h-[300px] w-full overflow-hidden rounded-[2rem] sm:h-[500px]">
            <img
              src={blog.coverImageUrl}
              alt={blog.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg mx-auto max-w-none text-[var(--sea-ink)] prose-headings:font-serif prose-headings:text-[var(--sea-ink)] prose-a:text-[var(--lagoon-deep)] prose-strong:text-[var(--sea-ink)] prose-img:rounded-3xl prose-pre:rounded-3xl">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </article>

      <section className="mt-20 border-t border-[var(--line)] pt-20">
        <div className="mb-12 flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-[var(--lagoon-deep)]" />
          <h2 className="display-title text-3xl font-bold text-[var(--sea-ink)]">
            Comments
          </h2>
          <span className="ml-2 rounded-full bg-[var(--line)] px-3 py-1 text-xs font-bold text-[var(--sea-ink-soft)]">
            {displayedComments?.length || 0}
          </span>
        </div>

        {user ? (
          <form
            onSubmit={handlePostComment}
            className="island-shell mb-12 rounded-3xl p-6"
          >
            <p className="mb-4 text-sm font-bold text-[var(--sea-ink-soft)]">
              Leave a comment as {user.username}
            </p>
            <div className="relative">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full min-h-[120px] rounded-2xl border border-[var(--line)] bg-white/30 p-4 text-sm transition focus:border-[var(--lagoon)] focus:outline-none focus:ring-4 focus:ring-[var(--lagoon)]/10"
                required
              />
              <button
                type="submit"
                disabled={postComment.isPending || !commentContent.trim()}
                className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-[var(--sea-ink)] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {postComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Post
              </button>
            </div>
          </form>
        ) : (
          <div className="island-shell mb-12 rounded-3xl p-8 text-center">
            <p className="mb-4 font-bold text-[var(--sea-ink)]">
              Join the conversation
            </p>
            <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
              Please log in to leave a comment and share your thoughts.
            </p>
            <Link
              to="/login"
              className="inline-flex rounded-xl bg-[var(--sea-ink)] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {isCommentsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--lagoon)]" />
            </div>
          ) : displayedComments?.length === 0 ? (
            <p className="text-center text-sm text-[var(--sea-ink-soft)]">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            displayedComments?.map((comment) => (
              <div
                key={comment.id}
                className="island-shell rise-in rounded-2xl p-6"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[var(--lagoon)]/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    </div>
                    <span className="text-sm font-bold text-[var(--sea-ink)]">
                      {comment.authorName}
                      {!comment.isApproved && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                          Pending Approval
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--sea-ink-soft)]">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--sea-ink-soft)]">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
