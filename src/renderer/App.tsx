import { ReactElement, useEffect } from "react";
import NavBar from "./components/NavBar";
import EncryptPassword from "./components/EncryptPassword";
import { RequestObject } from "./hooks";

const App = (): ReactElement => {
  useEffect(() => {
    (async () => {
      const request: RequestObject = {
        method: "GET",
        context: "getAllPasswords",
        payload: null,
      }
      const passwords = await window.electronAPI.getAllPasswords(request);
      console.log(passwords);
    })();
  }, []);

  return (
    <div>
      <NavBar />
      <EncryptPassword />
    </div>
  );
};

export default App;
