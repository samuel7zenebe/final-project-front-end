import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Blog, Category, Tag, Comment, User } from '../types'
import { toast } from 'sonner'

// const API_URL = 'https://final-project-api-z8wi.onrender.com'
const API_URL = 'http://localhost:5000'

export const apiFetch = async (endpoint: string, options: any = {}) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  // Only set Content-Type if it's not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Something went wrong' }))
    throw new Error(error.message || 'Something went wrong')
  }

  return response.json()
}

export const useUploadProfilePicture = () => {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('image', file)
      return apiFetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      })
    },
  })
}

export const useUploadBlogCover = () => {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('image', file)
      return apiFetch('/api/upload/blog-cover', {
        method: 'POST',
        body: formData,
      })
    },
  })
}

// Hooks
export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: () => apiFetch('/api/blogs').then((res) => res.blogs as Blog[]),
  })
}
export const useAllBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: () =>
      apiFetch('/api/blogs/all').then((res) => res.blogs as Blog[]),
  })
}
export const useBlog = (id: string | number) => {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: () => apiFetch(`/api/blogs/${id}`).then((res) => res.blog as Blog),
    enabled: !!id,
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      apiFetch('/api/categories').then((res) => res.categories as Category[]),
  })
}

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => apiFetch('/api/tags').then((res) => res.tags as Tag[]),
  })
}

export const useComments = (blogId: number) => {
  return useQuery({
    queryKey: ['comments', blogId],
    queryFn: () =>
      apiFetch(`/api/comments/${blogId}`).then(
        (res) => res.comments as Comment[],
      ),
    enabled: !!blogId,
  })
}

// Mutations
export const useCreateBlog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Blog>) =>
      apiFetch('/api/blogs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })
}

export const usePostComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      content: string
      blogId: number
      authorName: string
      authorEmail: string
    }) =>
      apiFetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.blogId],
      })
    },
  })
}

export const useUpdateBlogStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectedReason,
    }: {
      id: number
      status: Blog['status']
      rejectedReason?: string
    }) =>
      apiFetch(`/api/blogs/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, rejectedReason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      queryClient.refetchQueries({ queryKey: ['blogs'] })
    },
  })
}

export const useDeleteBlog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/blogs/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/comments/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}

export const useApproveComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/comments/${id}/approve`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })
}

// User Hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch('/api/users').then((res) => res.users),
  })
}

export const useUser = (id: number | string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiFetch(`/api/users/${id}`).then((res) => res.user),
    enabled: !!id,
  })
}

export const useBlogCategories = (id: number) => {
  return useQuery({
    queryKey: ['blog', id, 'categories'],
    queryFn: () =>
      apiFetch(`/api/blogs/${id}/categories`).then((res) => res.category),
    enabled: !!id,
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<User> }) =>
      apiFetch(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) =>
      apiFetch(`/api/users/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch('/api/users/me').then((res) => res.user as User),
  })
}

export const useUpdateMe = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<User>) =>
      apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data))
      }
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { oldPassword?: string; newPassword: string }) =>
      apiFetch('/api/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  })
}
