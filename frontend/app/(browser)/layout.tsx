import React from "react";
import Navbar from "./_components/navbar";

export default async function LayoutBrowser({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
    </>
  );
}
