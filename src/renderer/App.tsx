import Login from "./pages/EncryptPassword";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

const App = () => {
  return (
    <div>
      <Login />
    </div>
  );
};

root.render(<App />);
