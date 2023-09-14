import { SqlDatabase } from "../db";

type PhotonMethods = "GET" | "POST" | "PUT" | "DELETE";

type PhotonRequest<T> = {
  readonly method: PhotonMethods;
  readonly route: string;
  readonly payload: T;
};

type PhotonResponse<T> = {
  readonly method: PhotonMethods;
  readonly route: string;
  readonly status: "success" | "failure";
  payload: T;
};

type PhotonMiddleware = <T>(
  ctx: object,
  req: PhotonRequest<T>,
  res: PhotonResponse<T>
) => void | Promise<void>;

type NodeJSProcessEvent = "loaded" | "uncaughtException" | "unhandledRejection";

type PhotonContext<T = unknown> = {
  database?: SqlDatabase;
  body?: T;
  cancel?: (value?: unknown) => void;
  next?: (value?: unknown) => void;
  throw?: (value?: unknown) => void;
};

export default class Photon {
  public process: NodeJS.Process;
  public context: PhotonContext;
  private routesMap: Map<string, PhotonMiddleware[]>;
  private preHooks: PhotonMiddleware[];

  constructor(public config: { database?: SqlDatabase }) {
    const { database } = this.config;
    this.process = process;
    this.context = { database };
    this.preHooks = new Array<PhotonMiddleware>();
    this.routesMap = new Map<string, PhotonMiddleware[]>();
  }

  public on(
    event: NodeJSProcessEvent,
    callback: (...args: unknown[]) => void | Promise<void>
  ) {
    this.process.on(event, callback);
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

  public listen() {
    this.process.parentPort.on(
      "message",
      (messageEvent: Electron.MessageEvent) => {
        const { data, ports } = messageEvent;
        if (ports.length === 0) {
          throw new Error("No ports received with request");
        }
        const request: PhotonRequest<unknown> = data;
        const portToReceiver = ports[0];
      }
    );
  }

  public async execute(
    route: string,
    request: PhotonRequest<unknown>
  ): Promise<void> {
    const pipeline = this.buildPipeline(route);
    const ctx = { ...this.context };
    const response: PhotonResponse<unknown> = {
      method: request.method,
      payload: undefined,
      route,
      status: "failure",
    };

    for (let i = 0; i < pipeline.length; i++) {
      const func = pipeline[i];
      await func(ctx, request, response);
    }
  }

  private buildPipeline(route: string): PhotonMiddleware[] {
    const pipeline = this.routesMap.get(route);
    if (pipeline !== undefined) {
      return [...this.preHooks, ...pipeline];
    }
    return this.preHooks;
  }
}

class PhotonRunner {
  public runner: AsyncGenerator;

  constructor(
    public pipeline: PhotonMiddleware[],
    public ctx: PhotonContext,
    public request: PhotonRequest<unknown>,
    public response: PhotonResponse<unknown>
  ) {
    this.pipeline = pipeline;
    this.ctx = ctx;
    this.runner = this.buildRunner();
    this.ctx.cancel = this.cancel.bind(this);
    this.ctx.next = this.next.bind(this);
    this.ctx.throw = this.throw.bind(this);
  }

  private async *buildRunner() {
    const getCtx = () => this.ctx;
    for (let i = 0; i < this.pipeline.length; i++) {
      const func = this.pipeline[i];
      yield await func(getCtx(), this.request, this.response);
    }
  }

  public cancel(value?: unknown) {
    return this.runner.return(value);
  }

  public next(value?: unknown) {
    return this.runner.next(value);
  }

  public throw(value?: unknown) {
    return this.runner.throw(value);
  }
}
