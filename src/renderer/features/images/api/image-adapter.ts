export const imageAdapter = {
  upload(file: File) {
    return window.images.saveProductImage(file)
  },

  getPath(filename: string) {
    return window.images.getProductImagePath(filename)
  },

  delete(filename: string) {
    return window.images.deleteProductImage(filename)
  },
}
