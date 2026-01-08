type UploadImageResult = {
  filename: string
}

export const imageService = {
  async upload(file: File): Promise<UploadImageResult> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Tipo de archivo no soportado')
    }

    return imageAdapter.upload(file)
  },

  async getPath(filename: string) {
    if (!filename) return null
    const path = await imageAdapter.getPath(filename)
    return `myapp://${path}`
  },

  async delete(filename: string) {
    return imageAdapter.delete(filename)
  },
}
