import { MessagePortMain } from "electron";
import { SqlDatabase } from "../../db";

export type ValenceMethods = "GET" | "POST" | "PUT" | "DELETE";
export type ValenceResponseStatus = "success" | "failure" | "pending" | string;
export type ElectronPorts = Electron.ParentPort | MessagePortMain;

export type ValenceRequest<T = unknown> = {
  readonly method: ValenceMethods;
  readonly route: string;
  readonly payload: T;
};

export type ValenceResponse<T = unknown> = {
  readonly method: ValenceMethods;
  readonly route: string;
  status: ValenceResponseStatus;
  payload: T;
  port: MessagePortMain;
  setStatus: (status: ValenceResponseStatus) => void;
  send: (
    payload: unknown,
    transfer?: MessagePortMain[]
  ) => void | Promise<void>;
};

export type ValenceContext<B = unknown> = {
  request: ValenceRequest<B>;
  response: ValenceResponse<B>;
  body: B;
  datasources: {
    sql?: SqlDatabase;
  };
};

export type ValenceMiddleware = (
  ctx: ValenceContext,
  next: () => void | Promise<void>
) => void | Promise<void>;
