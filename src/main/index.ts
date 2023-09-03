import path from "path";
import {
  app,
  BrowserWindow,
  ipcMain,
  MessageChannelMain,
  utilityProcess,
  MessagePortMain,
  UtilityProcess,
} from "electron";
import { SqlDatabase } from "./db";
import { handleFileOpen, handleEncryptPassword, handleLogin } from "./handlers";

// type MessagePortMain = Electron.MessagePortMain

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

app.whenReady().then(async () => {
  ipcMain.handle("dialog:openFile", handleFileOpen);
  ipcMain.handle("encrypt-password", handleEncryptPassword);
  ipcMain.handle("login", handleLogin);
  await main();
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
    createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function main(): Promise<void> {
  const mainWindow = await createMainWindow();

  const child = await forkUtilityProcess("./child.js");

  const [port1, port2] = createPorts();

  // setup handler to output any received data from port2
  port1.on("message", (event) => {
    console.log(`[Message From Port 2]: ${event.data.message}`);
  });

  // Send the port to child process
  child.postMessage({ message: "sending port" }, [port2]);

  // Send a port to the renderer process
  mainWindow.webContents.postMessage("main-world-port", null, [port1]);

  port1.start();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

async function createMainWindow(): Promise<BrowserWindow> {
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
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  return mainWindow;
}

async function forkUtilityProcess(scriptPath: string): Promise<UtilityProcess> {
  const scriptAbsolutePath = path.join(__dirname, scriptPath);

  const child = utilityProcess.fork(scriptAbsolutePath, [], {
    stdio: "pipe",
    serviceName: "child-utility-process",
  });

  child.on("spawn", () => {
    child.stdout?.on("data", (data) => {
      console.log(`[Child Process][stdout]:${data}`);
    });

    console.log(
      `[Child process][Spawn Event detected] Forking utility process ${
        child.pid
      } at ${path.join(
        __dirname,
        scriptPath
      )}\nSetting up event handlers for child process`
    );
  });

  child.on("exit", () => {
    console.log(
      `[Child process][Exit Event detected] Child process ${child.pid} is exiting.`
    );
  });

  return child;
}

function createPorts(): MessagePortMain[] {
  const { port1, port2 } = new MessageChannelMain();

  return [port1, port2];
}
