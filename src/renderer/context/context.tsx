import { createContext, useState, useEffect, ReactNode } from "react";

export type NavigationContextType = {
  currentPath: string;
  navigate: ((to: string) => void) | undefined;
};

const initialNavigationValue: NavigationContextType = {
  currentPath: window.location.pathname,
  navigate: undefined,
};

const NavigationContext = createContext<NavigationContextType>(
  initialNavigationValue
);

function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname
  );

  useEffect(() => {
    const handler = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handler);

    return () => {
      window.removeEventListener("popstate", handler);
    };
  }, []);

  const navigate = (to: string): void => {
    window.history.pushState({}, "", to);
    setCurrentPath(to);
  };

  const value = {
    currentPath,
    navigate,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export { NavigationProvider };
export default NavigationContext;
