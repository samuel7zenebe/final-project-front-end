import { Link } from '@tanstack/react-router'
import { Calendar, User, ArrowRight } from 'lucide-react'
import Avatar from './Avatar'
import type { Blog } from '../types'
import { useBlogCategories, useUser } from '#/lib/api'

interface BlogCardProps {
  blog: Blog
}

export default function BlogCard({ blog }: BlogCardProps) {
  const { data: user } = useUser(blog.authorId)
  const { data: category } = useBlogCategories(blog.id)
  return (
    <article className="island-shell feature-card rise-in group relative flex flex-col overflow-hidden rounded-3xl p-0 transition-all hover:scale-[1.01]">
      <Link
        from="/"
        to="/blog/$id"
        params={{ id: blog.id.toString() }}
        className="absolute inset-0 z-10"
        aria-label={`Read ${blog.title}`}
      />

      {blog.coverImageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5">
            <Avatar
              src={user?.avatarUrl ?? ''}
              fallback={user?.username ?? ''}
              size="lg"
              className="w-3 h-3"
            />
            {user?.username || 'Author'}
          </span>
        </div>

        <h3 className="display-title mb-3 text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
          {blog.title}
        </h3>

        <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {blog.excerpt || 'No excerpt available.'}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
            Read More
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            {category?.name || 'Uncategorized'}
          </span>
        </div>
      </div>
    </article>
  )
}
