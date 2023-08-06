import React, { useState } from "react";

type InputEvent = React.ChangeEvent<HTMLInputElement>;
type FormEvent = React.FormEvent<HTMLFormElement>;

const EncryptPassword = () => {
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
    <div className="flex-wrap">
      Encrypt Password
      <form onSubmit={handleSubmit}>
        <div>
          Username:
          <input
            className="text-red-600 border-green-500 border"
            type="text"
            value={username}
            onChange={handleUsername}
          />
        </div>
        <div>
          Password:
          <input
            className="border rounded-md"
            type="text"
            value={password}
            onChange={handlePassword}
          />
        </div>
        <div>
          Secret Key:
          <input
            className="border rounded-md"
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
