import React, { useState } from "react";

type InputEvent = React.ChangeEvent<HTMLInputElement>;
type FormEvent = React.FormEvent<HTMLFormElement>;

const EncryptPassword = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [encryptedPassword, setEncryptedPassword] = useState();

  const handleUsername = (e: InputEvent): void => {
    setUsername(e.target.value);
  };

  const handlePassword = (e: InputEvent): void => {
    setPassword(e.target.value);
  };

  const handleEncryptionKey = (e: InputEvent): void => {
    setEncryptionKey(e.target.value);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const hash = await window.electronAPI.encryptPassword({
      username,
      password,
      encryptionKey,
    });
    setUsername("");
    setPassword("");
    setEncryptedPassword(hash);
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
          Encryption Key:
          <input
            className="border rounded-md"
            type="text"
            value={encryptionKey}
            onChange={handleEncryptionKey}
          />
        </div>
        <button>Encrypt</button>
      </form>
      <div>
        Encrypted Password: {encryptedPassword ?? "No password encrypted yet"}
      </div>
    </div>
  );
};

export default EncryptPassword;
