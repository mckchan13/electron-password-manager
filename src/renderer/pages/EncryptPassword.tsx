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
    await window.electronAPI.forkUtilityProcess({username, password})
    setUsername("")
    setPassword("")
  };

  return (
    <div>
      Encrypt Password
      <form onSubmit={handleSubmit}>
        <div>
          Username:
          <input type="text" value={username} onChange={handleUsername} />
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
