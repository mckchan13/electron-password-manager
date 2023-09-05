import { ReactElement } from "react";
import NavBar from "./components/NavBar";
import EncryptPassword from "./components/EncryptPassword";
import useMainPort from "./hooks/useMainPort";

const App = (): ReactElement => {
  
  useMainPort();

  return (
    <div>
      <NavBar />
      <EncryptPassword />
    </div>
  );
};

export default App;
