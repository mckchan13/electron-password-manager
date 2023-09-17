import { ReactElement, useEffect } from "react";
import { RequestObject } from "./hooks";
import NavBar from "./components/NavBar";
import EncryptPassword from "./components/EncryptPassword";
import Route from "./components/Route";

const App = (): ReactElement => {
    const fetchAllPasswords = async () => {
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
            await fetchAllPasswords();
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
            <button className="border border-black" onClick={fetchAllPasswords}>
                Get All Passwords{" "}
            </button>
        </div>
    );
};

export default App;
