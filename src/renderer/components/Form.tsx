import { ReactNode, useReducer, useState } from "react";
import {
  FormEvent,
  InputEvent,
  RequestObject,
} from "../hooks/useEncryptPasswordState";

import useFormChangeReducer, { FormData } from "../hooks/useFormChangeReducer";

const { createInitialState, formChangeReducer, actionCreator } =
  useFormChangeReducer();

const Form = (): ReactNode => {
  const [encryptedPassword, setEncryptedPassword] = useState("");
  const [{ username, password, secret }, dispatch] = useReducer(
    formChangeReducer,
    null,
    createInitialState
  );

  const handleReduceUsername = (event: InputEvent) => {
    dispatch(actionCreator("username", event.target.value));
  };

  const handleReducePassword = (event: InputEvent) => {
    dispatch(actionCreator("password", event.target.value));
  };

  const handleReduceSecretKey = (event: InputEvent) => {
    dispatch(actionCreator("secret", event.target.value));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!username || !password || !secret) {
      console.error("All fields must be filled out");
      return;
    }

    const request = {
      method: "POST",
      route: "savePassword",
      channel: "savePassword",
      payload: {
        username,
        password,
        secret,
      },
    } satisfies RequestObject<FormData>;

    const response = await window.electronAPI.fetch(request);

    setEncryptedPassword(response.payload);
    dispatch(actionCreator("reset", ""));
  };

  return (
    <div className="flex-col">
      Encrypt Password
      <form onSubmit={handleSubmit}>
        <div className="flex-1 mx-2 py-3">
          Username:
          <input
            className="border border-slate-500 rounded-md"
            type="text"
            value={username}
            onChange={handleReduceUsername}
          />
        </div>
        <div className="flex-1 mx-2 py-3">
          Password:
          <input
            className="border border-slate-500 rounded-md"
            type="text"
            value={password}
            onChange={handleReducePassword}
          />
        </div>
        <div className="flex-1 mx-2 py-3">
          Secret Key:
          <input
            className="border border-slate-500 rounded-md"
            type="text"
            value={secret}
            onChange={handleReduceSecretKey}
          />
        </div>
        <button className="border border-black bg-slate-300 rounded-md px-3 py-1">
          Encrypt
        </button>
      </form>
      <div>
        Encrypted Password:{" "}
        {encryptedPassword.length
          ? encryptedPassword
          : "No password encrypted yet"}
      </div>
    </div>
  );
};

export default Form;
