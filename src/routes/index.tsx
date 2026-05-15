import { createFileRoute } from '@tanstack/react-router'
import { useBlogs } from '../lib/api'
import BlogCard from '../components/BlogCard'

export const Route = createFileRoute('/')({ component: App })

function BlogGridSkeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="island-shell feature-card overflow-hidden rounded-3xl border-border p-0"
        >
          <div className="h-48 animate-pulse bg-muted" />
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap gap-3">
              <div className="h-3 w-28 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="h-7 max-w-[85%] animate-pulse rounded-lg bg-muted" />
            <div className="space-y-2 pt-1">
              <div className="h-3 w-full animate-pulse rounded bg-muted/90" />
              <div className="h-3 w-full animate-pulse rounded bg-muted/90" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted/90" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function App() {
  const { data: blogs, isLoading, error } = useBlogs()

  return (
    <main className="page-wrap px-4 pb-20 pt-14">
      <section className="mb-16 text-center">
        <p className="island-kicker mb-4">Latest Insights</p>
        <h1 className="display-title mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
          The Blog.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Explore our latest stories, technical guides, and industry insights.
          Expertly curated for the modern developer.
        </p>
      </section>

      {isLoading ? (
        <div className="min-h-[400px]">
          <BlogGridSkeleton />
        </div>
      ) : error ? (
        <div className="island-shell rounded-2xl p-10 text-center border-border bg-card/50">
          <p className="text-destructive font-semibold">
            Error loading blogs:{' '}
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs?.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
          {blogs?.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl text-muted-foreground font-medium">
                No blogs published yet.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
