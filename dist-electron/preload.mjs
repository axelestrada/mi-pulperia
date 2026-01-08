"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  products: {
    list: () => electron.ipcRenderer.invoke("products:list"),
    create: (product) => electron.ipcRenderer.invoke("products:create", product),
    update: (id, product) => electron.ipcRenderer.invoke("products:update", id, product),
    remove: (id) => electron.ipcRenderer.invoke("products:remove", id)
  },
  categories: {
    list: () => electron.ipcRenderer.invoke("categories:list"),
    create: (category) => electron.ipcRenderer.invoke("categories:create", category),
    update: (id, category) => electron.ipcRenderer.invoke("categories:update", id, category),
    remove: (id) => electron.ipcRenderer.invoke("categories:remove", id)
  }
});
electron.contextBridge.exposeInMainWorld("images", {
  saveProductImage: async (file) => electron.ipcRenderer.invoke(
    "save-product-image",
    Buffer.from(
      new Uint8Array(file.arrayBuffer ? await file.arrayBuffer() : [])
    )
  ),
  getProductImagePath: (filename) => electron.ipcRenderer.invoke("get-product-image-path", filename),
  deleteProductImage: (filename) => electron.ipcRenderer.invoke("delete-product-image", filename)
});
