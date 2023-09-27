import { ReactNode } from "react";
import Link from "./Link";

const NavBar = (): ReactNode => {
  const links = [
    { label: "Home", path: "/" },
    { label: "Passwords", path: "/passwords" },
    { label: "Settings", path: "/settings" },
  ];

  const renderedLinks = links.map(({ label, path }) => {
    return (
      <li key={label} className="flex-1 text-center text-gray-100 border">
        <Link key={label} to={path}>
          {label}
        </Link>
      </li>
    );
  });

  return (
    <nav>
      <ul className="flex gap-2 py-3 bg-slate-500">{renderedLinks}</ul>
    </nav>
  );
};

export default NavBar;
