import React, { PropsWithChildren, ReactElement, useContext } from "react";
import NavigationContext from "../context/context";

export type AnchorClickEvent = React.MouseEvent<HTMLAnchorElement, MouseEvent>;

export type LinkProps = PropsWithChildren<{ to: string }>;

function Link({ to, children }: LinkProps): ReactElement<LinkProps> {
  const { navigate } = useContext(NavigationContext);

  const handleClick = (event: AnchorClickEvent) => {
    event.preventDefault();
    if (navigate) {
      navigate(to);
    }
  };

  return <a onClick={handleClick}>{children}</a>;
}

export default Link;
