import placeholder from '@/assets/images/placeholder.svg'

import { Image } from '@heroui/react'

type Props = {
  src: string | null
  alt: string
}

export const ProductImage = ({ src, alt }: Props) => {
  const { data: imagePath } = useImagePath(src)

  return (
    <Image
      src={imagePath || placeholder}
      fallbackSrc={placeholder}
      alt={alt}
      isBlurred
      className="w-14 aspect-4/3 object-cover bg-white"
    />
  )
}
