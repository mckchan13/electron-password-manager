import { MessagePortMain } from "electron";
import { SqlDatabase } from "../../db";

export type ValenceMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ValenceResponseStatus = "success" | "failure" | "pending" | string;
export type ElectronPorts = Electron.ParentPort | MessagePortMain;
export type Datasources<K extends string | symbol | number, V> = Record<K, V>;

export type ValenceMainResponseMethods = {
    setStatus: (status: ValenceResponseStatus) => void;
    send: (payload: unknown, transfer?: MessagePortMain[]) => void | Promise<void>;
};

export type ValenceRequest<T = unknown> = {
    method: ValenceMethods;
    route: string;
    payload: T;
};

export type ValenceMainRequest<T = unknown> = Readonly<ValenceRequest<T>>;

export type ValenceResponse<T = unknown> = {
    readonly method: ValenceMethods;
    readonly route: string;
    status: ValenceResponseStatus;
    payload: T;
    port: MessagePortMain;
    setStatus: ValenceMainResponseMethods["setStatus"];
    send: ValenceMainResponseMethods["send"];
};

export type ValenceRendererResponse<T = unknown> = Omit<
    Readonly<ValenceResponse<T>>,
    keyof ValenceMainResponseMethods
>;

export type ValenceContext<B = unknown, D = SqlDatabase | unknown> = {
    request: ValenceMainRequest<B>;
    response: ValenceResponse<B>;
    body: B;
    datasources: Datasources<string, D>;
};

export type ValenceMiddleware = (
    ctx: ValenceContext,
    next: () => void | Promise<void>
) => void | Promise<void>;
