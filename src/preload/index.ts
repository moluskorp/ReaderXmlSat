import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI, ElectronAPI } from '@electron-toolkit/preload'
import { IPC } from '../shared/constants/ipc'
import {
  Directory,
  XmlGetRequest,
  XmlReadFilesRequest,
} from '../shared/types/ipc'
import { Xml } from '../shared/types/xml'
import { Item } from '../shared/types/item'

declare global {
  export interface Window {
    electron: ElectronAPI
    api: typeof api
  }
}

const api = {
  changeDirectory(): Promise<string | null> {
    return ipcRenderer.invoke(IPC.DIRECTORY.CHANGE_DIRECTORY)
  },
  getDirectory(): Promise<Directory | null> {
    return ipcRenderer.invoke(IPC.DIRECTORY.GET_DIRECTORY)
  },
  xmlReadFiles(): Promise<void> {
    return ipcRenderer.invoke(IPC.XML.READ_FILES)
  },
  GetOrders(req: XmlReadFilesRequest): Promise<Xml[]> {
    return ipcRenderer.invoke(IPC.XML.GET_ORDERS, req)
  },
  xmlGet(req: XmlGetRequest): Promise<Xml> {
    return ipcRenderer.invoke(IPC.XML.GET_XML, req)
  },
  xmlItemsGet(xmlId: string): Promise<Item[]> {
    return ipcRenderer.invoke(IPC.XML_ITEMS.GET_XMLITEMS, xmlId)
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
