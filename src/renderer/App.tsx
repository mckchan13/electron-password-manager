import { ReactElement, useEffect } from "react";
import { RequestObject } from "./hooks";
import NavBar from "./components/NavBar";
import EncryptPassword from "./components/EncryptPassword";
import Route from "./components/Route";
import Button from "./components/Button";

const App = (): ReactElement => {
    const handleFetchPasswords = async () => {
        const request: RequestObject = {
            method: "GET",
            route: "getAllPasswords",
            channel: "getAllPasswords",
            payload: undefined,
        };
        const passwords = await window.electronAPI.fetch(request);
        console.log(passwords);
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
            <Button primary secondary outline rounded onClick={handleFetchPasswords}>
                Get Passwords
            </Button>
        </div>
    );
};

export default App;
