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

import { handleFileOpen, handleEncryptPassword, handleLogin } from "./handlers";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Instantiate an array to house any spawned child processes
const childProcesses: UtilityProcess[] = [];

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
  main();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Gracefully exit any child processes running
  for (const childProcess of childProcesses) {
    childProcess.kill();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// In case the child process unexpectedly quit, log details to console for debugging
app.on("child-process-gone", (_, details) => {
  console.log(`Child Process unexpectedly quit:`);
  console.log(details);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function main(): void {
  const mainWindow = createMainWindow();

  const child = forkUtilityProcess("./child.js");

  const [port1, port2] = createMessagePorts();

  // setup handler to output any received data from port2
  port1.on("message", (event) => {
    console.log(`[Message From Port 2]: ${event.data.message}`);
  });

  // Send the port to child process
  child.postMessage("port", [port2]);

  // Send a port to the renderer process
  mainWindow.webContents.postMessage("main-world-port", null, [port1]);

  port1.start();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  console.log(`App ${app.name} is ready and starting.`);
}

function createMainWindow(): BrowserWindow {
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

  return mainWindow;
}

function forkUtilityProcess(scriptPath: string): UtilityProcess {
  const scriptAbsolutePath = path.join(__dirname, scriptPath);

  const child = utilityProcess.fork(scriptAbsolutePath, [], {
    stdio: "pipe",
    serviceName: "child-utility-process",
  });

  // setup listener for parent to receive messages from child process
  child.on("message", (event) => {
    console.log(`[Message received from Child Process] ${event.message}`);
  });

  // setup listener to log when the child process has spawned
  child.once("spawn", () => {
    // when child process has spawned, the stdout property should not be null
    child.stdout?.on("data", (data) => {
      console.log(`[Child Process][stdout]:${data}`);
    });

    child.stderr?.on("data", (data) => {
      console.log(`[Child Process][stderr]:${data}`);
    });

    console.log(
      `[Child process][Spawn Event fired] Forking utility process ${
        child.pid
      } at ${path.join(
        __dirname,
        scriptPath
      )}\nSetting up event handlers for child process`
    );
  });

  // make any child processes available in outer scope so
  // that they may be terminated gracefully when app quits
  childProcesses.push(child);

  return child;
}

function createMessagePorts(): MessagePortMain[] {
  const { port1, port2 } = new MessageChannelMain();

  return [port1, port2];
}
