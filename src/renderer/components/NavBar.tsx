import { useContext, useCallback, ReactNode } from "react";
import NavigationContext from "../context/context";

const NavBar = (): ReactNode => {
    const { navigate } = useContext(NavigationContext);

    const handleNavigation = useCallback((path: string) => {
        return () => {
            if (navigate) {
                navigate(path);
            }
        };
    }, []);

    return (
        <nav>
            <ul className="flex gap-2 py-3 bg-slate-500">
                <li className="flex-1 text-center text-gray-100 border">
                    <button onClick={handleNavigation("/")}>Home</button>
                </li>
                <li className="flex-1 text-center text-gray-100 border">
                    <button onClick={handleNavigation("/passwords")}>Passwords</button>
                </li>
                <li className="flex-1 text-center text-gray-100 border">
                    <button onClick={handleNavigation("/settings")}>Settings</button>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
