import EncryptPassword from "./components/EncryptPassword";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

const App = () => {
  return (
    <>
      <EncryptPassword />
    </>
  );
};

root.render(<App />);
