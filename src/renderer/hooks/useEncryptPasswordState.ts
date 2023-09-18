import { useState } from "react";

export type RequestHook<M = unknown, R = unknown> = (message: M) => Promise<R>;

export type RequestObject<T = unknown, K = string> = {
  method: "GET" | "POST" | "PUT" | "DELETE";
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
  secretKey: string;
};

export type FormFields = {
  username: string;
  password: string;
  secretKey: string;
};

export type InputEvent = React.ChangeEvent<HTMLInputElement>;
export type FormEvent = React.FormEvent<HTMLFormElement>;

function useEncryptPasswordState() {
  const [username, setUsername] = useState<string>("username");
  const [password, setPassword] = useState<string>("password");
  const [secretKey, setSecretKey] = useState<string>("secret");
  const [encryptedPassword, setEncryptedPassword] = useState<string>();

  const handleUsername = (e: InputEvent): void => {
    setUsername(e.target.value);
  };

  const handlePassword = (e: InputEvent): void => {
    setPassword(e.target.value);
  };

  const handleSecretKey = (e: InputEvent): void => {
    setSecretKey(e.target.value);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!username || !password || !secretKey) {
      console.error("All fields must be filled out");
      return;
    }

    const request: RequestObject<SavePasswordPayload> = {
      method: "POST",
      route: "savePassword",
      channel: "savePassword",
      payload: {
        username,
        password,
        secretKey,
      },
    };

    const response = await window.electronAPI.fetch(request);

    console.log(response);

    const encrypted = await window.electronAPI.encryptPassword({
      username,
      password,
      secretKey,
    });

    setUsername("");
    setPassword("");
    setSecretKey("");
    setEncryptedPassword(encrypted);
  };

  return {
    username,
    password,
    secretKey,
    encryptedPassword,
    handleUsername,
    handlePassword,
    handleSecretKey,
    handleSubmit,
  };
}

export default useEncryptPasswordState;
