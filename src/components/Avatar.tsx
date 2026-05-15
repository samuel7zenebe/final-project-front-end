import React from 'react'
import { User as UserIcon } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({ src, alt, fallback, className = '', size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  }

  // Generate a default avatar URL if none is provided
  const defaultAvatar = fallback 
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallback)}`
    : null

  const displaySrc = src || defaultAvatar

  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : ''

  return (
    <div
      className={`relative flex shrink-0 overflow-hidden rounded-full border border-border bg-muted ${sizeClasses[size]} ${className}`}
    >
      {displaySrc ? (
        <img
          src={displaySrc}
          alt={alt || 'Avatar'}
          className="aspect-square h-full w-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it to show fallback
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : null}
      <div className="flex h-full w-full items-center justify-center font-bold text-muted-foreground">
        {initials || <UserIcon className="h-1/2 w-1/2 opacity-50" />}
      </div>
    </div>
  )
}
