import { cn } from '@/lib/utils'

type SafeImageProps = {
  src?: string | null
  alt: string
  className?: string
  fallbackSrc?: string
}

import placeholder from '@/assets/images/placeholder.svg'

export const SafeImage = ({ src, alt, className }: SafeImageProps) => {
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
        <img
          src={placeholder}
          alt={alt}
          className="h-full w-full object-cover"
        />
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
