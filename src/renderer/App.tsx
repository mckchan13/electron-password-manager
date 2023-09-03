import React, { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import NavBar from "./components/NavBar";
import EncryptPassword from "./components/EncryptPassword";
import useMainPort from "./hooks/useMainPort";

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

const App = (): ReactElement => {
  
  useMainPort();

  return (
    <div>
      <NavBar />
      <EncryptPassword />
    </div>
  );
};

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
