import { PropsWithChildren, ReactNode } from "react";
import useNavigation from "../hooks/useNavigation";

export interface RouteProps {
    path: string;
}

function Route({ children, path }: PropsWithChildren<RouteProps>): ReactNode {
    const { currentPath } = useNavigation();

    if (path === currentPath) {
        return children;
    }

    return null;
}

export default Route;
