// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

const electronAPI = {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  encryptPassword: ({
    username,
    password,
    secretKey,
  }: {
    username: string;
    password: string;
    secretKey: string;
  }) => {
    return ipcRenderer.invoke("encrypt-password", [
      username,
      password,
      secretKey,
    ]);
  },
  forkUtilityProcess: ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    return ipcRenderer.invoke("utilityProcess:fork", [username, password]);
  },
} as const

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

declare global {
  export type ElectronAPI = typeof electronAPI;
  export type ElectronMethods = (typeof electronAPI)[keyof typeof electronAPI];
  export type HandlerArguments = Parameters<ElectronMethods>[0]
  export interface Window {
    electronAPI: ElectronAPI;
  }
}
