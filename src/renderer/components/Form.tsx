import { useReducer, useState, ReactElement } from "react";
import { FormEvent, InputEvent, RequestObject } from "../types/types";

import useFormChangeReducer, {
  ActionType,
  FormData,
} from "../hooks/useFormChangeReducer";

type FieldData = { label: string; action: ActionType; value: string };

const { createInitialState, formChangeReducer, actionCreator } =
  useFormChangeReducer();

const Form = (): ReactElement => {
  const [encryptedPassword, setEncryptedPassword] = useState<string>("");
  const [{ username, password, secret }, dispatch] = useReducer(
    formChangeReducer,
    null,
    createInitialState
  );

  const formFields = [
    { label: "Username", action: "USERNAME", value: username },
    { label: "Password", action: "PASSWORD", value: password },
    { label: "Secret", action: "SECRET", value: secret },
  ] satisfies FieldData[];

  const renderedFormFields = formFields.map(({ label, action, value }) => {
    const handleChange = (e: InputEvent) =>
      dispatch(actionCreator(action, e.target.value));

    return (
      <div key={label} className="flex-1 mx-2 py-3">
        {label}:
        <input
          className="border border-slate-500 rounded-md"
          type="text"
          value={value}
          onChange={handleChange}
        />
      </div>
    );
  });

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
    dispatch(actionCreator("RESET", ""));
  };

  return (
    <div className="flex-col">
      Encrypt Password
      <form onSubmit={handleSubmit}>
        {renderedFormFields}
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
