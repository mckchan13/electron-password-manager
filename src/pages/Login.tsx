import React, { useState } from "react";

declare global {
  interface ElectronAPI {
    openFile: () => Promise<string>;
  }

  interface Window {
    electronAPI: ElectronAPI;
  }
}

type InputEvent = React.ChangeEvent<HTMLInputElement>;
type FormEvent = React.FormEvent<HTMLFormElement>;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentFilePath, setCurrentFilePath] = useState("");

  const handleUsername = (e: InputEvent): void => {
    setUsername(e.target.value);
  };

  const handlePassword = (e: InputEvent): void => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    console.log(e);
  };

  const handleClick = async () => {
    const filePath = await window.electronAPI.openFile();
    setCurrentFilePath(filePath);
  };

  return (
    <div>
      Please login
      <form onSubmit={handleSubmit}>
        <div>
          Username:
          <input type="text" value={username} onChange={handleUsername} />
        </div>
        <div>
          Password:
          <input type="text" value={password} onChange={handlePassword} />
        </div>
        <button>Login</button>
      </form>
      <button onClick={handleClick}>Load File Path</button>
      <div>
        Current File Path:{" "}
        {currentFilePath ? currentFilePath : "No File Loaded"}
      </div>
    </div>
  );
};

export default Login;
