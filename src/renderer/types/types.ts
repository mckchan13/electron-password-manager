import { ValenceMethods } from "../../lib/Valence";

export type RequestHook<M = unknown, R = unknown> = (message: M) => Promise<R>;

export type RequestObject<T = unknown, K = string> = {
  method: ValenceMethods;
  route: K;
  payload: T;
  channel: string;
};

export type ResponseObject<T = unknown, K = unknown> = {
  status: "success" | "failure";
  context: K;
  payload: T;
};

export type SavePasswordPayload = {
  username: string;
  password: string;
  secret: string;
};

export type FormFields = {
  username: string;
  password: string;
  secretKey: string;
};

export type InputEvent = React.ChangeEvent<HTMLInputElement>;

export type FormEvent = React.FormEvent<HTMLFormElement>;
