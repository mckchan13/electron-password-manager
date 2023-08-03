// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

const electronAPI = {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  forkUtilityProcess: ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    console.log("ipcRenderer is being called");
    return ipcRenderer.invoke("utilityProcess:fork", [username, password]);
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

declare global {
  type ElectronMethods = ElectronAPI[keyof ElectronAPI];
  type ElectronAPI = typeof electronAPI;
  interface Window {
    electronAPI: ElectronAPI;
  }
}
