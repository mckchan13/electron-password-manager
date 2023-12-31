// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { RequestObject, ResponseObject } from "../renderer/hooks";

// We need to wait until the main world is ready to receive the message before
// sending the port. We create this promise in the preload so it's guaranteed
// to register the onload listener before the load event is fired.
const windowLoaded = new Promise((resolve) => {
  window.onload = resolve;
});

ipcRenderer.on("main-world-port", async (event) => {
  await windowLoaded;
  // We use regular window.postMessage to transfer the port from the isolated
  // world to the main world.
  window.postMessage("main-world-port", "*", event.ports);
});

const electronAPI = {
  openFile: (): Promise<unknown> => ipcRenderer.invoke("dialog:openFile"),

  getAllPasswords: invokePortRequest("getAllPasswords"),

  fetch: (request: RequestObject) => {
    const { channel } = request;
    return ipcRenderer.invoke(channel, request);
  },

  encryptPassword: ({
    username,
    password,
    secretKey,
  }: {
    username: string;
    password: string;
    secretKey: string;
  }): Promise<string> => {
    return ipcRenderer.invoke("encrypt-password", [
      username,
      password,
      secretKey,
    ]);
  },
} as const;

const valenceAPI = {
  fetch: (request: RequestObject) => {
    const { channel } = request;
    return ipcRenderer.invoke(channel, request);
  },
} as const;

function invokePortRequest(
  channel: string
): (request: RequestObject) => Promise<ResponseObject> {
  return (request: RequestObject) => ipcRenderer.invoke(channel, request);
}

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
contextBridge.exposeInMainWorld("valenceAPI", valenceAPI);

declare global {
  export type ValenceAPI = typeof valenceAPI;
  export type ElectronAPI = typeof electronAPI;
  export type ElectronAPIKeys = keyof ElectronAPI;
  export type ElectronMethods = (typeof electronAPI)[keyof typeof electronAPI];
  export type HandlerArguments = Parameters<ElectronMethods>;
  export interface Window {
    electronAPI: ElectronAPI;
    valenceAPI: ValenceAPI;
  }
}
