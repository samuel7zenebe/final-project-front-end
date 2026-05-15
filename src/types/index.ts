export type UserRole = 'USER' | 'ADMIN'
export type BlogStatus = 'draft' | 'pending_review' | 'published' | 'rejected'

export interface User {
  id: number
  email: string
  username: string
  role: UserRole
  avatarUrl?: string
}

export interface Blog {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  status: BlogStatus
  authorId: number
  author?: User
  categoryId: number | null
  category?: Category
  readCount: number
  publishedAt: string | null
  rejectedReason: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Comment {
  id: number
  content: string
  authorName: string
  authorEmail: string
  blogId: number
  isApproved: boolean
  createdAt: string
}
