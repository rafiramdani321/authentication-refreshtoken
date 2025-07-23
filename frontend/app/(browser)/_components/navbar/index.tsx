import React from "react";
import NavLink from "./navLink";
import Actions from "./actions";

const Navbar = () => {
  return (
    <nav className="bg-teal-600 h-16 flex w-full">
      <div className="flex w-full justify-between items-center px-36">
        <NavLink />
        <Actions />
      </div>
    </nav>
  );
};

export default Navbar;
