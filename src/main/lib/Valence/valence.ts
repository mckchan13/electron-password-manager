import { MessagePortMain } from "electron";
import { SqlDatabase } from "../../db";
import { RequestObject } from "../../../renderer/hooks";
import {
  ValenceMiddleware,
  ValenceRequest,
  ValenceContext,
  ValenceResponseStatus,
  ElectronPorts,
} from "./types";

export class Valence {
  private process: NodeJS.Process;
  private datasources: { sql?: SqlDatabase };
  private routesMap: Map<string, ValenceMiddleware[]>;
  private preHooks: ValenceMiddleware[];

  constructor(public config?: { datasources?: unknown }) {
    this.process = process;
    this.datasources = this.config?.datasources ?? {};
    this.preHooks = [];
    this.routesMap = new Map<string, ValenceMiddleware[]>();
  }

  public usePreHook(...middleware: ValenceMiddleware[]): Valence {
    this.preHooks.push(...middleware);
    return this;
  }

  public use(route: string, ...middleware: ValenceMiddleware[]): Valence {
    if (!this.routesMap.has(route)) {
      this.routesMap.set(route, []);
    }
    const pipeline = this.routesMap.get(route);
    if (pipeline !== undefined) {
      pipeline.push(...middleware);
    }
    return this;
  }

  public addDatasource<D = unknown>(key: string, database: D): void {
    const datasources = this.datasources as Record<typeof key, typeof database>;
    datasources[key] = database;
  }

  public listen(callback?: (port: ElectronPorts) => void): void;
  public listen(
    port?: ElectronPorts,
    callback?: (port?: ElectronPorts) => void
  ): void;
  public listen(
    portOrCallback?: ElectronPorts | ((port: ElectronPorts) => void),
    callback?: (port: ElectronPorts) => void
  ): void {
    this.buildAllPipelines();

    let port: ElectronPorts = this.process.parentPort;

    if (portOrCallback !== undefined && typeof portOrCallback !== "function") {
      port = portOrCallback;
    } else if (portOrCallback !== undefined) {
      port = this.process.parentPort;
      callback = portOrCallback;
    }

    port.on("message", async ({ data, ports }: Electron.MessageEvent) => {
      const request: RequestObject = data;
      const portToReceiver = ports[0];
      await this.execute(request, portToReceiver);
    });

    if (callback !== undefined) {
      callback(port);
    }
  }

  private async execute(
    request: RequestObject,
    port: MessagePortMain
  ): Promise<void> {
    const pipeline = this.routesMap.get(request.route);

    if (pipeline === undefined) {
      throw new ReferenceError(
        "Route was not found. Check if a specified route exists."
      );
    }

    const ctx = this.contextBuilder(request, port);
    let prevIdx = -1;

    const runner = async (idx: number): Promise<void> => {
      if (idx === prevIdx) throw new SyntaxError("Next was called twice.");
      prevIdx = idx;
      const func = pipeline[idx];
      if (func !== undefined) {
        await func(ctx, () => runner(idx + 1));
      }
    };

    await runner(0);
  }

  private buildAllPipelines(): void {
    for (const [route, pipeline] of this.routesMap) {
      this.routesMap.set(route, [...this.preHooks, ...pipeline]);
    }
  }

  private contextBuilder(
    request: ValenceRequest,
    port: MessagePortMain
  ): ValenceContext {
    const datasources = this.datasources;
    const { method, route } = request;
    const context = {
      datasources,
      body: {},
      request,
      response: {
        method,
        route,
        status: "pending",
        payload: undefined,
        port,
        setStatus: function (status: ValenceResponseStatus) {
          this.status = status;
        },
        send: function (payload: unknown): void {
          this.setStatus("success");
          const { method, route, port, status } = this;
          port.postMessage({
            method,
            route,
            status,
            payload,
          });
          port.start();
        },
      },
    };

    context.response.setStatus.bind(context.response);
    context.response.send.bind(context.response);

    return context;
  }
}
