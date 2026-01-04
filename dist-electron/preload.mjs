import electron from "electron"
electron.contextBridge.exposeInMainWorld("api", {
  products: {
    list: () => electron.ipcRenderer.invoke("products:list")
  },
  categories: {
    list: () => electron.ipcRenderer.invoke("categories:list"),
    create: (category) => electron.ipcRenderer.invoke("categories:create", category),
    update: (id, category) => electron.ipcRenderer.invoke("categories:update", id, category),
    remove: (id) => electron.ipcRenderer.invoke("categories:remove", id)
  },
  images: {
    upload: (args) => electron.ipcRenderer.invoke("images:upload", args),
    saveBase64: (args) => electron.ipcRenderer.invoke("images:saveBase64", args),
    getBase64: (args) => electron.ipcRenderer.invoke("images:getBase64", args),
    getPath: (args) => electron.ipcRenderer.invoke("images:getPath", args),
    delete: (args) => electron.ipcRenderer.invoke("images:delete", args),
    list: (args) => electron.ipcRenderer.invoke("images:list", args)
  },
  backup: {
    create: () => electron.ipcRenderer.invoke("backup:create"),
    createAuto: () => electron.ipcRenderer.invoke("backup:createAuto"),
    list: () => electron.ipcRenderer.invoke("backup:list"),
    clean: (keepLast) => electron.ipcRenderer.invoke("backup:clean", keepLast),
    restore: (args) => electron.ipcRenderer.invoke("backup:restore", args)
  }
})
