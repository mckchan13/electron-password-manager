import { ReactElement, useEffect } from "react";
import NavBar from "./components/NavBar";
import EncryptPassword from "./components/EncryptPassword";

const App = (): ReactElement => {
  useEffect(() => {
    (async () => {
      const passwords = await window.electronAPI.getAllPasswords();
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
