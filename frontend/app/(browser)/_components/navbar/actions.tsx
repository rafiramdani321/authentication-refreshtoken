"use client";

import React from "react";
import Link from "next/link";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { showToastError } from "@/lib/toast";

const Actions = () => {
  const { accessToken, isAuthResolved, clearAccessToken } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const isLoggedIn = !!accessToken;

  if (!isAuthResolved) return null;

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });

      clearAccessToken();
      window.location.reload();
    } catch (error) {
      showToastError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoggedIn ? (
        <Button disabled={isLoading} onClick={() => handleLogout()}>
          Logout
        </Button>
      ) : (
        <Link href="/auth/signin">
          <Button className="uppercase">Login</Button>
        </Link>
      )}
    </>
  );
};

export default Actions;
