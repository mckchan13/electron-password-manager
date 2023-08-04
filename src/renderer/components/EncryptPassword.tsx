import { ipcRenderer } from "electron";
import React, { useState } from "react";

type InputEvent = React.ChangeEvent<HTMLInputElement>;
type FormEvent = React.FormEvent<HTMLFormElement>;

const EncryptPassword = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsername = (e: InputEvent): void => {
    setUsername(e.target.value);
  };

  const handlePassword = (e: InputEvent): void => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    await window.electronAPI.encryptPassword({username, password})
    setUsername("")
    setPassword("")
  };

  return (
    <div className="flex-wrap text-red-500">
      Encrypt Password
      <form onSubmit={handleSubmit}>
        <div>
          Username:
          <input className="text-red-600" type="text" value={username} onChange={handleUsername} />
        </div>
        <div>
          Password:
          <input type="text" value={password} onChange={handlePassword} />
        </div>
        <button>Encrypt</button>
      </form>
    </div>
  );
};

export default EncryptPassword;
