import React from "react";

const NavBar = (): React.ReactElement => {
  return (
    <nav>
      <ul className="flex gap-2 py-3 bg-slate-500">
        <li className="flex-1 text-center text-gray-100">Login</li>
        <li className="flex-1 text-center text-gray-100">Passwords</li>
        <li className="flex-1 text-center text-gray-100">Settings</li>
      </ul>
    </nav>
  );
};

export default NavBar;
