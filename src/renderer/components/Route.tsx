import { ReactElement } from "react";
import useNavigation from "../hooks/useNavigation";

export interface ChildrenProps {
    children: ReactElement;
}

export interface RouteProps extends ChildrenProps {
    path: string;
}

function Route({ children, path }: RouteProps) {
    const { currentPath } = useNavigation();

    if (path === currentPath) {
        return children;
    }

    return null;
}

export default Route;
