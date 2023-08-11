import React, { ReactElement, useState } from "react";

type InputEvent = React.ChangeEvent<HTMLInputElement>;
type FormEvent = React.FormEvent<HTMLFormElement>;

const EncryptPassword = (): ReactElement => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [encryptedPassword, setEncryptedPassword] = useState();

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
            onChange={handleUsername}
          />
        </div>
        <div className="flex-1 mx-2 py-3">
          Password:
          <input
            className="border border-slate-500 rounded-md"
            type="text"
            value={password}
            onChange={handlePassword}
          />
        </div>
        <div className="flex-1 mx-2 py-3">
          Secret Key:
          <input
            className="border border-slate-500 rounded-md"
            type="text"
            value={secretKey}
            onChange={handleSecretKey}
          />
        </div>
        <button className="border border-black bg-slate-300 rounded-md px-3 py-1">
          Encrypt
        </button>
      </form>
      <div>
        Encrypted Password: {encryptedPassword ?? "No password encrypted yet"}
      </div>
    </div>
  );
};

export default EncryptPassword;
