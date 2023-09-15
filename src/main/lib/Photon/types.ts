import { MessagePortMain } from "electron";
import { SqlDatabase } from "../../db";

export type PhotonMethods = "GET" | "POST" | "PUT" | "DELETE";
export type PhotonResponseStatus = "success" | "failure" | "pending" | string;

export type PhotonRequest<T = unknown> = {
  readonly method: PhotonMethods;
  readonly route: string;
  readonly payload: T;
};

export type PhotonResponse<T = unknown> = {
  readonly method: PhotonMethods;
  readonly route: string;
  status: PhotonResponseStatus
  payload: T;
  port: MessagePortMain;
  setStatus: (status: PhotonResponseStatus) => void;
  send: (
    payload: unknown,
    transfer?: MessagePortMain[]
  ) => void | Promise<void>;
};

export type PhotonContext<B = unknown> = {
  request: PhotonRequest<B>;
  response: PhotonResponse<B>;
  body: B;
  datasources: {
    sql?: SqlDatabase;
  };
};

export type PhotonMiddleware = (
  ctx: PhotonContext,
  next?: () => void | Promise<void>
) => void | Promise<void>;