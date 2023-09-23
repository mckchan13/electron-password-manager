import {
  MouseEvent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { RequestObject } from "./hooks";
import NavBar from "./components/NavBar";
import EncryptPassword from "./components/EncryptPassword";
import Route from "./components/Route";
import Button from "./components/Button";

const App = (): ReactElement => {
  console.log("App is rendering");
  const [passwords, setPasswords] = useState<unknown[]>([]);
  console.log(passwords);

  const Rows = passwords.map((value: any) => {
    return <div key={value.id}>{value.name}</div>;
  });

  const handleFetchPasswords = async (event?: MouseEvent) => {
    if (event !== undefined) {
      event.preventDefault();
    }

    const request: RequestObject = {
      method: "GET",
      route: "getAllPasswords",
      channel: "getAllPasswords",
      payload: undefined,
    };

    const response = await window.electronAPI.fetch(request);
    console.log(response);
    setPasswords(response.payload);
  };

  useEffect(() => {
    (async () => {
      await handleFetchPasswords();
    })();
  }, []);

  return (
    <div>
      <NavBar />
      <Route path="/">
        <div>Home</div>
      </Route>
      <Route path="/passwords">
        <EncryptPassword />
      </Route>
      <Button primary outline rounded onClick={handleFetchPasswords}>
        Get Passwords
      </Button>
      {Rows.length && Rows}
    </div>
  );
};

export default App;
