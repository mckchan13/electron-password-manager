import EncryptPassword from "./components/EncryptPassword";
import { createRoot } from "react-dom/client";
import NavBar from "./components/NavBar";

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

const App = () => {
  return (
    <div>
      <NavBar/>
      <EncryptPassword />
    </div>
  );
};

root.render(<App />);
