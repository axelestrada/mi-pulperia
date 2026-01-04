import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'

interface ImageUploaderProps {
  category: 'products' | 'categories'
  currentImage?: string | null
  onImageChange: (filename: string | null) => void
  disabled?: boolean
}

/**
 * Componente para subir y gestionar imágenes
 * Permite subir desde el sistema de archivos o arrastrar y soltar
 */
export function ImageUploader({
  category,
  currentImage,
  onImageChange,
  disabled = false,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Cargar preview si hay imagen actual
  useState(() => {
    if (currentImage) {
      loadImagePreview(currentImage)
    }
  })

  const loadImagePreview = async (filename: string) => {
    try {
      const result = await window.api.images.getBase64({
        filename,
        category,
      })

      if (result.success && result.base64) {
        setPreview(result.base64)
      }
    } catch (error) {
      console.error('Error al cargar preview:', error)
    }
  }

  const handleUpload = async () => {
    if (disabled) return

    try {
      setLoading(true)
      const result = await window.api.images.upload({ category })

      if (result.success && result.filename) {
        onImageChange(result.filename)
        await loadImagePreview(result.filename)
      }
    } catch (error) {
      console.error('Error al subir imagen:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (disabled || !currentImage) return

    try {
      setLoading(true)
      const result = await window.api.images.delete({
        filename: currentImage,
        category,
      })

      if (result.success) {
        onImageChange(null)
        setPreview(null)
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((f) => f.type.startsWith('image/'))

    if (!imageFile) return

    try {
      setLoading(true)

      // Convertir a base64
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string

        const result = await window.api.images.saveBase64({
          base64Data: base64,
          category,
        })

        if (result.success && result.filename) {
          onImageChange(result.filename)
          setPreview(base64)
        }

        setLoading(false)
      }

      reader.readAsDataURL(imageFile)
    } catch (error) {
      console.error('Error al procesar imagen:', error)
      setLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Imagen</label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleUpload}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {loading
              ? 'Subiendo...'
              : 'Haz clic o arrastra una imagen aquí'}
          </p>
        </div>
      )}
    </div>
  )
}
