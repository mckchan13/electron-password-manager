import { MessagePortMain } from "electron";
import { RequestObject } from "../../../renderer/hooks";
import {
  ValenceMiddleware,
  ElectronPorts,
  Datasources,
} from "./types";
import ValenceContextBuilder from "./ContextBuilder";

export class Valence {
  private contextBuilder = new ValenceContextBuilder();
  private routesMap = new Map<string, ValenceMiddleware[]>();
  private preHooks: ValenceMiddleware[] = [];
  private process: NodeJS.Process;

  constructor(public config?: { datasources?: unknown }) {
    this.process = process;

    if (this.config && this.config.datasources) {
      this.contextBuilder.loadDatasources(
        this.config.datasources as Datasources<string, unknown>
      );
    }
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

  public loadDatasource(
    datasources: Datasources<string, unknown>
  ): ValenceContextBuilder {
    this.contextBuilder.loadDatasources(datasources);
    return this.contextBuilder;
  }

  public addDatasource<T = unknown>(key: string, datasource: T): void {
    this.contextBuilder.setDatasource(key, datasource);
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

    // const ctx = this.buildContext(request, port);
    const ctx = this.contextBuilder
      .loadRequest(request)
      .loadPort(port)
      .loadResponse()
      .build();

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
}
