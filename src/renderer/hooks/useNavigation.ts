import { useContext } from "react";
import NavigationContext from "../context/context";

function useNavigation() {
    return useContext(NavigationContext);
}

export default useNavigation;
