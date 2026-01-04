import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUploader } from '@/components/ui/image-uploader'
import { BackupManager } from '@/components/ui/backup-manager'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'

interface Product {
  id: number | string
  name: string
  image?: string | null
}

/**
 * Ejemplo de uso del sistema de imágenes y backups
 */
export function ExamplePage() {
  const [productName, setProductName] = useState('')
  const [productImage, setProductImage] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const result = await window.api.products.list()
      setProducts(result)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const handleSaveProduct = async () => {
    if (!productName) {
      toast.error('Ingresa un nombre de producto')
      return
    }

    try {
      // Aquí guardarías el producto con la imagen
      console.log('Guardando producto:', {
        name: productName,
        image: productImage,
      })

      toast.success('Producto guardado exitosamente')
      setProductName('')
      setProductImage(null)
      loadProducts()
    } catch (error) {
      toast.error('Error al guardar producto')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-muted-foreground">
            Ejemplo de uso del sistema de imágenes y backups
          </p>
        </div>
        <BackupManager />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulario de producto */}
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Producto</CardTitle>
            <CardDescription>
              Agrega un producto con imagen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ej: Coca Cola 500ml"
              />
            </div>

            <ImageUploader
              category="products"
              currentImage={productImage}
              onImageChange={setProductImage}
            />

            <Button onClick={handleSaveProduct} className="w-full">
              Guardar Producto
            </Button>
          </CardContent>
        </Card>

        {/* Lista de productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Guardados</CardTitle>
            <CardDescription>
              Total: {products.length} productos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay productos guardados
                </p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {product.image ? (
                      <ProductImage
                        filename={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          Sin foto
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {product.id}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información del sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
          <CardDescription>
            Ubicación de archivos y estadísticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Base de Datos</p>
              <p className="text-xs text-muted-foreground">
                userData/mi-pulperia.db
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Imágenes</p>
              <p className="text-xs text-muted-foreground">
                userData/images/
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Backups</p>
              <p className="text-xs text-muted-foreground">
                Documents/MiPulperiaBackups/
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Componente auxiliar para mostrar imágenes de productos
 */
function ProductImage({ filename, alt }: { filename: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  useEffect(() => {
    loadImage()
  }, [filename])

  const loadImage = async () => {
    try {
      const result = await window.api.images.getBase64({
        filename,
        category: 'products',
      })

      if (result.success && result.base64) {
        setImageSrc(result.base64)
      }
    } catch (error) {
      console.error('Error al cargar imagen:', error)
    }
  }

  if (!imageSrc) {
    return (
      <div className="w-12 h-12 bg-muted rounded animate-pulse" />
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="w-12 h-12 object-cover rounded"
    />
  )
}
