"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  products: {
    list: () => electron.ipcRenderer.invoke("products:list")
  },
  categories: {
    list: () => electron.ipcRenderer.invoke("categories:list"),
    create: (category) => electron.ipcRenderer.invoke("categories:create", category)
  }
});
