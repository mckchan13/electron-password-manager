import React, { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import NavBar from "./components/NavBar";
import EncryptPassword from "./components/EncryptPassword";

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

const App = (): ReactElement => {
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
