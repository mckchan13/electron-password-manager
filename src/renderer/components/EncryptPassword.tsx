import { ReactNode } from "react";
import useEncryptPasswordState from "../hooks/useEncryptPasswordState";

const EncryptPassword = (): ReactNode => {
  const {
    username,
    password,
    secretKey,
    encryptedPassword,
    handleUsername,
    handlePassword,
    handleSecretKey,
    handleSubmit,
  } = useEncryptPasswordState();

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
