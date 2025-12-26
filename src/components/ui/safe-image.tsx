import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type SafeImageProps = {
  src?: string | null
  alt: string
  className?: string
  fallbackSrc?: string
}

export const SafeImage = ({
  src,
  alt,
  className,
  fallbackSrc = '/images/placeholder.svg',
}: SafeImageProps) => {
  const [hasError, setHasError] = useState(false)

  const showFallback = !src || hasError

  return (
    <div
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-md bg-muted',
        className
      )}
    >
      {showFallback ? (
        fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}
