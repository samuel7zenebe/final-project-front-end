import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useState } from 'react'
import { useAuth } from '#/hooks/useAuth'
import { useCreateBlog, useCategories, useTags, useUploadBlogCover } from '../../lib/api'
import Editor from '#/components/Editor'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  Loader2,
  Image as ImageIcon,
  Tags,
  Layout,
  Send,
  Save,
  X,
  Upload,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/new')({
  component: NewBlogPostPage,
})

function NewBlogPostPage() {
  const { user, loading: authLoading } = useAuth()
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  const createBlog = useCreateBlog()
  const uploadMutation = useUploadBlogCover()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const response = await uploadMutation.mutateAsync(file)
      // Assuming response contains { url: '...' }
      if (response.url) {
        setCoverImageUrl(response.url)
      }
    } catch (err) {
      console.error('Upload failed', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return

    try {
      await createBlog.mutateAsync({
        title,
        slug:
          slug ||
          title
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, ''),
        excerpt,
        content,
        coverImageUrl,
        categoryId: categoryId ? Number(categoryId) : null,
        status: 'draft',
      })
      navigate({ to: '/dashboard' })
    } catch (err) {
      console.error('Failed to create blog', err)
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
    <main className="w-full px-4 sm:px-8 py-12 max-w-[1600px] mx-auto">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="display-title mb-2 text-4xl font-bold text-foreground">
            Create Post
          </h1>
          <p className="text-muted-foreground font-medium">
            Craft your next masterpiece.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createBlog.isPending}>
            {createBlog.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <Card className="rounded-3xl border-border shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12 space-y-8">
              <div className="space-y-3">
                <Label
                  htmlFor="title"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Post Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a catchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-3xl sm:text-4xl font-extrabold h-auto py-4 rounded-2xl border-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/30"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="excerpt"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Brief Excerpt
                </Label>
                <textarea
                  id="excerpt"
                  placeholder="A short summary of your post..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full min-h-[80px] rounded-2xl border border-border bg-muted/30 p-4 text-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Article Body
                </Label>
                <Editor content={content} onChange={setContent} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="rounded-3xl border-border shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Layout className="h-5 w-5 text-primary" />
                  Select Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories?.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id.toString())}
                      className={`cursor-pointer rounded-2xl p-4 border-2 transition-all text-center ${
                        categoryId === cat.id.toString()
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5'
                          : 'border-border bg-muted/20 hover:border-primary/50'
                      }`}
                    >
                      <p className={`text-sm font-bold ${categoryId === cat.id.toString() ? 'text-primary' : 'text-muted-foreground'}`}>
                        {cat.name}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Visuals & Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="coverImage" className="text-sm font-bold text-foreground">
                    Cover Image
                  </Label>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl border-dashed border-2 h-24 w-full flex flex-col items-center justify-center gap-2 transition hover:border-primary hover:bg-primary/5"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs font-semibold text-muted-foreground">
                            {coverImageUrl ? 'Change Image' : 'Upload Cover Image'}
                          </span>
                        </>
                      )}
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {coverImageUrl && (
                    <div className="mt-4 aspect-video rounded-2xl overflow-hidden border border-border shadow-inner group relative">
                      <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="rounded-xl"
                          onClick={() => setCoverImageUrl('')}
                        >
                          <X className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Tags className="h-4 w-4" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags?.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                        className={`cursor-pointer rounded-lg px-3 py-1 transition ${
                          selectedTags.includes(tag.id)
                            ? 'bg-primary hover:bg-primary/90'
                            : 'hover:bg-primary/10 text-muted-foreground border-border'
                        }`}
                        onClick={() => {
                          setSelectedTags((prev) =>
                            prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                          )
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-2xl h-14 px-8"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={createBlog.isPending}
            className="rounded-2xl h-14 px-10 bg-primary shadow-xl shadow-primary/20"
          >
            {createBlog.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Send className="h-5 w-5 mr-2" />
            )}
            Publish Post
          </Button>
        </div>
      </form>
    </main>
  )
}
