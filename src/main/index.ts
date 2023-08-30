import path from "path";
import {
  app,
  BrowserWindow,
  ipcMain,
  MessageChannelMain,
  utilityProcess,
} from "electron";
import { SqlDatabase } from "./db";
import { handleFileOpen, handleEncryptPassword, handleLogin } from "./handlers";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    webPreferences: {
      preload: path.join(__dirname, "../build/preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    console.log("Starting app in development mode");
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

app.whenReady().then(() => {
  ipcMain.handle("dialog:openFile", handleFileOpen);
  ipcMain.handle("encrypt-password", handleEncryptPassword);
  ipcMain.handle("login", handleLogin);
  SqlDatabase.instance.initDb();
  console.log("App is ready... creating main window");
  const port1 = forkUtilityProcess("/child.js");

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    SqlDatabase.instance.closeDb();
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function forkUtilityProcess(scriptPath: string): Electron.MessagePortMain {
  // Main process
  const { port1, port2 } = new MessageChannelMain();

  const scriptAbsolutePath = path.join(__dirname, scriptPath);

  const child = utilityProcess.fork(scriptAbsolutePath, [], {
    stdio: "pipe",
  });

  console.log(
    `Forking utility process... running script at ${path.join(
      __dirname,
      scriptPath
    )}\nSetting up event handlers for child process`
  );

  child.on("exit", () => {
    console.log(
      "[Child process][Exit Event detected] Child process is exiting."
    );
  });

  child.stdout?.on("data", (data) => {
    console.log(`[Child Process][stdout]:${data}`);
  });

  child.postMessage({ message: "hello" }, [port2]);

  port1.on("message", ({ data }) => {
    console.log(`port1 received message ${data.message}`);
  });

  port1.start();

  return port1;
}
