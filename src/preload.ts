// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  forkUtilityProcess: ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => ipcRenderer.send("utilityProcess:fork", [username, password]),
});
