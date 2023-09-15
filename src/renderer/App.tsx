import { ReactElement, useEffect } from "react";
import NavBar from "./components/NavBar";
import EncryptPassword from "./components/EncryptPassword";
import { RequestObject } from "./hooks";

const App = (): ReactElement => {
  const fetchPassword = async () => {
    const request: RequestObject = {
      method: "GET",
      route: "getAllPasswords",
      channel: "getAllPasswords",
      payload: null,
    };
    const passwords = await window.electronAPI.fetch(request);
    console.log(passwords);
  };

  useEffect(() => {
    (async () => {
      await fetchPassword();
    })();
  }, []);

  return (
    <div>
      <NavBar />
      <EncryptPassword />
      <button className="border-black" onClick={fetchPassword}>
        Get All Passwords{" "}
      </button>
    </div>
  );
};

export default App;
