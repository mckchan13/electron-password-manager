import { ReactElement } from "react";
import NavBar from "./components/NavBar";
import Form from "./components/Form";
import Route from "./components/Route";
import Button from "./components/Button";
import { PasswordEntry } from "../main/db";

import useFetchPasswords from "./hooks/useFetchAllPasswords";

const App = (): ReactElement => {
  const { passwords, handleFetchPasswords } = useFetchPasswords();

  const Rows = passwords.map(
    ({ id, username, password, descriptor }: PasswordEntry) => {
      return <div key={id}>{username + " " + password + " " + descriptor}</div>;
    }
  );

  console.log(Rows);

  return (
    <div>
      <NavBar />
      <Route path="/">
        <div>Home</div>
      </Route>
      <Route path="/passwords">
        <Form />
      </Route>
      <Button primary outline rounded onClick={handleFetchPasswords}>
        Get Passwords
      </Button>
      {Rows.length && Rows}
    </div>
  );
};

export default App;
