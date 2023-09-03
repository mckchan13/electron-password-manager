import React, { ReactElement, useState } from "react";

type FormEvent = React.FormEvent<HTMLFormElement>;
type InputEvent = React.ChangeEvent<HTMLInputElement>;

const Login = (): ReactElement => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleUsernameChange = (e: InputEvent) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: InputEvent) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    await window.electronAPI.login({ username, password });
    setUsername("");
    setPassword("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          Username:
          <input
            value={username}
            onChange={handleUsernameChange}
            className="border border-slate-300"
          />
        </div>
        <div>
          Password:
          <input
            value={password}
            onChange={handlePasswordChange}
            className="border border-slate-300"
          />
        </div>
        <button>Submit</button>
      </form>
    </div>
  );
};

export default Login;
