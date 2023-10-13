import { BrowserWindow, UtilityProcess, utilityProcess } from "electron";
import path from "node:path";

export type ValenceService = BrowserWindow | UtilityProcess;

export type ChildOptions = {
  serviceName: string;
  scriptPath: string;
  args?: string[];
  options?: Electron.ForkOptions;
};

class ValenceMain {
  private services = new Map<string, ValenceService>();
  private renderers = new Map<string, BrowserWindow>();
  constructor(
    public mainConfig?: Record<string, unknown>,
    public childConfigs?: ChildOptions[],
    public rendererConfigs?: unknown[]
  ) {
    const children = [];

    if (childConfigs?.length) {
      for (const config of childConfigs) {
        const child = this.forkUtilityProcess(
          config.scriptPath,
          config.args,
          config.options
        );
      }
    }
  }

  public async forkUtilityProcess(
    scriptPath: string,
    args?: string[],
    options?: Electron.ForkOptions
  ): Promise<UtilityProcess> {
    return utilityProcess.fork(scriptPath, args, options);
  }

  public async createMainWindow(): Promise<BrowserWindow> {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      height: 768,
      width: 1024,
      webPreferences: {
        preload: path.join(__dirname, "../build/preload.js"),
      },
    });

    if (this.mainConfig && this.mainConfig.vite) {
      const {
        devServerUrl: MAIN_WINDOW_VITE_DEV_SERVER_URL,
        mainWindowName: MAIN_WINDOW_VITE_NAME,
      } = this.mainConfig.vite as {
        devServerUrl: string;
        mainWindowName: string;
      };
      // and load the index.html of the app.
      if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        console.log("Starting app in development mode");
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
      } else {
        mainWindow.loadFile(
          path.join(
            __dirname,
            `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
          )
        );
      }
    }

    return mainWindow;
  }
}

export default ValenceMain;
