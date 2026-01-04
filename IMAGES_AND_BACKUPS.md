# 📸 Sistema de Gestión de Imágenes y Backups

## 🎯 Resumen

Este proyecto incluye un sistema completo para:

- ✅ Guardar imágenes de productos y categorías
- ✅ Crear backups automáticos de base de datos + imágenes
- ✅ Restaurar backups completos
- ✅ Gestión eficiente de archivos

## 📁 Estructura de Archivos

```
userData/
├── mi-pulperia.db          # Base de datos SQLite
└── images/                  # Directorio de imágenes
    ├── products/            # Imágenes de productos
    │   ├── 1-abc123.jpg
    │   └── 2-def456.png
    └── categories/          # Imágenes de categorías
        └── 1-xyz789.jpg
```

### Ubicación de userData por Sistema Operativo:

- **Windows**: `C:\Users\{usuario}\AppData\Roaming\mi-pulperia`
- **macOS**: `~/Library/Application Support/mi-pulperia`
- **Linux**: `~/.config/mi-pulperia`

## 🚀 Uso desde el Frontend

### 1. Subir Imagen desde el Sistema de Archivos

```tsx
import { ImageUploader } from '@/components/ui/image-uploader'

function ProductForm() {
  const [imageFilename, setImageFilename] = useState<string | null>(null)

  return (
    <ImageUploader
      category="products"
      currentImage={imageFilename}
      onImageChange={setImageFilename}
    />
  )
}
```

### 2. Subir Imagen desde Base64

```tsx
const handleImageUpload = async (base64Data: string) => {
  const result = await window.api.images.saveBase64({
    base64Data: base64Data,
    category: 'products',
    id: productId, // Opcional
  })

  if (result.success) {
    console.log('Imagen guardada:', result.filename)
  }
}
```

### 3. Obtener Imagen como Base64

```tsx
const loadImage = async (filename: string) => {
  const result = await window.api.images.getBase64({
    filename: filename,
    category: 'products',
  })

  if (result.success && result.base64) {
    // result.base64 viene con el prefijo: data:image/jpeg;base64,...
    setImagePreview(result.base64)
  }
}
```

### 4. Gestión de Backups

```tsx
import { BackupManager } from '@/components/ui/backup-manager'

function SettingsPage() {
  return (
    <div>
      <h1>Configuración</h1>
      <BackupManager />
    </div>
  )
}
```

## 🔧 API Disponible

### Images API

```typescript
// Subir imagen con diálogo del sistema
window.api.images.upload({
  category: 'products' | 'categories',
  id: number,
})

// Guardar desde base64
window.api.images.saveBase64({
  base64Data: string,
  category: 'products' | 'categories',
  id: number,
})

// Obtener imagen como base64
window.api.images.getBase64({
  filename: string,
  category: 'products' | 'categories',
})

// Obtener ruta del archivo
window.api.images.getPath({
  filename: string,
  category: 'products' | 'categories',
})

// Eliminar imagen
window.api.images.delete({
  filename: string,
  category: 'products' | 'categories',
})

// Listar todas las imágenes de una categoría
window.api.images.list({
  category: 'products' | 'categories',
})
```

### Backup API

```typescript
// Crear backup manual (abre diálogo para elegir ubicación)
window.api.backup.create()

// Crear backup automático en Documents/MiPulperiaBackups
window.api.backup.createAuto()

// Listar todos los backups automáticos
window.api.backup.list()

// Limpiar backups antiguos (mantiene los últimos 10)
window.api.backup.clean(keepLast?: number)

// Restaurar backup
window.api.backup.restore({
  path: string,
  createBackupBefore?: boolean
})
```

## 📊 Schema de Base de Datos

### Products Table

```typescript
{
  id: number
  name: string
  image: string | null // Nombre del archivo (ej: "1-abc123.jpg")
  price: number
  stock: number
  barcode: string | null
  description: string | null
}
```

### Categories Table

```typescript
{
  id: number
  name: string
  description: string | null
  image: string | null // Nombre del archivo
  isActive: boolean
  createdAt: Date
  deleted: boolean
}
```

## 🔄 Migración de Base de Datos

Para aplicar los nuevos campos de imagen, ejecuta:

```bash
npm run db:generate  # Genera la migración
npm run db:migrate   # Aplica la migración
```

O si prefieres hacerlo manualmente, crea un archivo SQL en `drizzle/`:

```sql
-- 0004_add_image_columns.sql
ALTER TABLE products ADD COLUMN image TEXT;
ALTER TABLE categories ADD COLUMN image TEXT;
```

## 💾 Backups Automáticos

### Contenido de un Backup

Cada backup incluye:

- ✅ Base de datos completa (`mi-pulperia.db`)
- ✅ Todas las imágenes (directorio `images/`)
- ✅ Metadata del backup (fecha, versión, plataforma)

### Estrategia Recomendada

1. **Backup Manual**: Antes de actualizaciones importantes
2. **Backup Automático**: Diario o semanal (programar tarea)
3. **Limpieza**: Mantener solo los últimos 10-20 backups

### Ejemplo de Backup Programado

```typescript
// En main.ts o en un servicio
setInterval(async () => {
  try {
    await backupManager.createAutoBackup()
    await backupManager.cleanOldBackups(10)
    console.log('Backup automático creado')
  } catch (error) {
    console.error('Error en backup automático:', error)
  }
}, 24 * 60 * 60 * 1000) // Cada 24 horas
```

## 🎨 Componentes UI

### ImageUploader

Componente completo con:

- Drag & Drop
- Click para subir
- Preview de imagen
- Botón de eliminar
- Estados de carga

### BackupManager

Diálogo con:

- Crear backup manual
- Crear backup automático
- Listar backups existentes
- Limpiar backups antiguos
- Información de tamaño y fecha

## 🔒 Consideraciones de Seguridad

1. **Validación de Imágenes**: Solo se aceptan formatos válidos (JPG, PNG, GIF, BMP, WEBP)
2. **Nombres Únicos**: Se usa MD5 hash del contenido para evitar duplicados
3. **Ubicación Segura**: Los archivos se guardan en `userData`, protegido por el sistema operativo
4. **Backups Encriptados**: Considera encriptar backups para datos sensibles

## 📈 Mejoras Futuras

- [ ] Compresión de imágenes antes de guardar
- [ ] Redimensionamiento automático (thumbnails)
- [ ] Backups en la nube (Google Drive, Dropbox)
- [ ] Restauración selectiva de backups
- [ ] Encriptación de backups
- [ ] Programación automática de backups desde UI

## 🐛 Troubleshooting

### Las imágenes no se cargan

1. Verifica que el directorio `images/` existe en userData
2. Revisa los permisos del directorio
3. Comprueba que el nombre del archivo es correcto

### Los backups no se crean

1. Verifica permisos de escritura en Documents
2. Instala la dependencia: `npm install archiver`
3. Revisa los logs de Electron

### Error al migrar

1. Ejecuta: `npm run db:generate`
2. Luego: `npm run db:migrate`
3. Si falla, aplica manualmente el SQL

## 📞 Soporte

Para más información, revisa:

- [Image Manager](electron/main/utils/image-manager.ts)
- [Backup Manager](electron/main/utils/backup-manager.ts)
- [Images IPC](electron/main/ipc/images-ipc.ts)
- [Backup IPC](electron/main/ipc/backup-ipc.ts)
