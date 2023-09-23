import path from "path";
import {
  app,
  BrowserWindow,
  ipcMain,
  utilityProcess,
  UtilityProcess,
} from "electron";

import { handleFileOpen, handleEncryptPassword } from "./handlers";
import { handleValenceRequest } from "../lib/Valence/main/ValenceMain";

export type PathLocationName = Parameters<typeof app.getPath>[0];

export type PathMessage<M, B> = {
  message: M;
  body: B;
};

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

//! Instantiate an array to house any spawned child processes
const childProcesses: UtilityProcess[] = [];

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

app.whenReady().then(() => {
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
  // ? On OS X it's common to re-create a window in the app when the
  // ? dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// ? In case the child process unexpectedly quit, log details to console for debugging
app.on("child-process-gone", (_event, details) => {
  console.log(`Child Process unexpectedly quit:`);
  console.log(details);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function main(): Promise<void> {
  try {
    const userDataPath = app.getPath("userData");

    // ! Fork a child process to handle all database transactions/api calls to avoid
    // ! blocking main process with cpu intensive read/writes/encryptions
    const child = forkUtilityProcess("./child.js");

    // ! Need to await for child to set the writable data path and ensure
    // ! the listener fires and then can be re-assigned to fire for all subsequent messages
    await new Promise((resolve) => {
      const pathMessage: PathMessage<PathLocationName, string> = {
        message: "userData",
        body: userDataPath,
      };

      child.prependOnceListener("message", (message) => {
        if (message === "userPathSet") {
          console.log("Child process has set user path successfully");
          resolve(true);
        }
      });

      child.postMessage(pathMessage);
    });

    //! setup listener for parent to receive messages from child process
    child.on("message", (message) => {
      console.log(`[Message received from Child Process] ${message}`);
    });

    //! Attach handlers AFTER user path is set so that the child listener
    //! can deal with that event, and reappend a new listener for all subsequent events
    await attachIpcHandlers();

    // ? This may need optimization, could cause for laggy startup experience for user
    // ? create mainwindow at very end so that user cannot send messages
    // ? until all setup is complete
    const mainWindow = await createMainWindow();

    // ! Open the DevTools.
    mainWindow.webContents.openDevTools();

    console.log(`App ${app.name} is ready and starting.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
    }
  }
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
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  return mainWindow;
}

async function attachIpcHandlers(): Promise<void> {
  const child = childProcesses.at(-1);
  assertsChildProcessHasSpawned(child);

  ipcMain.handle("dialog:openFile", handleFileOpen);
  ipcMain.handle("encrypt-password", handleEncryptPassword);
  ipcMain.handle("getAllPasswords", handleValenceRequest(child));
  ipcMain.handle("savePassword", handleValenceRequest(child));
}

function forkUtilityProcess(scriptPath: string): UtilityProcess {
  const scriptAbsolutePath = path.join(__dirname, scriptPath);

  //! Set stdio to pipe so that child console logs will be visible from terminal
  const child = utilityProcess.fork(scriptAbsolutePath, [], {
    stdio: "pipe",
    serviceName: "child-utility-process",
  });

  // !setup listener to log when the child process has spawned
  child.once("spawn", () => {
    //! When child process has spawned, the stdout property should not be null
    //! Setup listeners to console log whenever there is a console log or error
    //! for debugging the child process

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
      )}\nSetting up event handlers to pipe child process stdio and stderr to main process stdio`
    );
  });

  // make any child processes available in outer scope so
  // that they may be terminated gracefully when app quits
  childProcesses.push(child);

  return child;
}

function assertsChildProcessHasSpawned<T = UtilityProcess | undefined>(
  child: T
): asserts child is NonNullable<T> {
  if (child === undefined || child === null) {
    throw new Error();
  }
}
