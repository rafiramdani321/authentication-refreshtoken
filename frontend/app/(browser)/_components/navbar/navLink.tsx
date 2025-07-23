"use client";

import { useAuthStore } from "@/store/useAuthStore";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const dataLink = [
  {
    id: 1,
    name: "Home",
    href: "/",
  },
  {
    id: 2,
    name: "Service",
    href: "/service",
  },
  {
    id: 3,
    name: "About",
    href: "/about",
  },
];

const NavLink = () => {
  const pathname = usePathname();
  const { accessToken } = useAuthStore();

  const isLoggedIn = !!accessToken;

  return (
    <div className="flex gap-x-5 text-xl font-semibold uppercase text-white">
      {dataLink.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={clsx(pathname === item.href && "underline")}
        >
          {item.name}
        </Link>
      ))}
      {isLoggedIn ? (
        <Link
          href="/profile"
          className={clsx(pathname === "/profile" && "underline")}
        >
          Profile
        </Link>
      ) : null}
    </div>
  );
};

export default NavLink;
