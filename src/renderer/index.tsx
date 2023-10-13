import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { NavigationProvider } from "./context/context";

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <NavigationProvider>
      <App />
    </NavigationProvider>
  </React.StrictMode>
);
