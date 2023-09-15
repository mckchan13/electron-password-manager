import { MessagePortMain } from "electron";
import { SqlDatabase } from "../../db";
import { RequestObject } from "../../../renderer/hooks";
import {
  PhotonMiddleware,
  PhotonRequest,
  PhotonContext,
  PhotonResponseStatus,
} from "./types";

export class Photon {
  public process: NodeJS.Process;
  private routesMap: Map<string, PhotonMiddleware[]>;
  private preHooks: PhotonMiddleware[];
  private datasources: { sql?: SqlDatabase };

  constructor(public config?: { datasources?: unknown }) {
    console.log("Photon is constructing");
    this.process = process;
    this.datasources = this.config?.datasources ?? {};
    this.preHooks = new Array<PhotonMiddleware>();
    this.routesMap = new Map<string, PhotonMiddleware[]>();
  }

  public pre(...middleware: PhotonMiddleware[]): Photon {
    this.preHooks.push(...middleware);
    return this;
  }

  public use(route: string, ...middleware: PhotonMiddleware[]): Photon {
    if (!this.routesMap.has(route)) {
      this.routesMap.set(route, []);
    }
    const pipeline = this.routesMap.get(route);
    if (pipeline !== undefined) {
      pipeline.push(...middleware);
    }
    return this;
  }

  public addDatasource(key: string, database: unknown): void {
    const datasources = this.datasources as Record<typeof key, typeof database>;
    datasources[key] = database;
  }

  public listen(
    callback?: (port?: Electron.ParentPort | MessagePortMain) => void
  ) {
    this.buildAllPipelines();
    this.process.parentPort.on(
      "message",
      async ({ data, ports }: Electron.MessageEvent) => {
        if (ports.length === 0) {
          throw new Error("No ports received with request");
        }
        const request: RequestObject = data;
        const portToReceiver = ports[0];
        await this.execute(request, portToReceiver);
      }
    );

    if (callback) {
      callback(this.process.parentPort);
    }
  }

  private async execute(
    request: RequestObject,
    port: MessagePortMain
  ): Promise<void> {
    console.log(`Getting route ${request.route}`);
    const pipeline = this.routesMap.get(request.route);

    if (pipeline === undefined) {
      throw new Error("Route not found.");
    }

    const ctx = this.contextBuilder(request, port);
    let prevIdx = -1;

    const runner = async (idx: number): Promise<void> => {
      if (idx === prevIdx) throw new Error("Next called twice");
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
    request: PhotonRequest,
    port: MessagePortMain
  ): PhotonContext {
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
        setStatus: function (status: PhotonResponseStatus) {
          this.status = status;
        },
        send: function <T = unknown>(payload: T): void {
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

    return context;
  }
}
