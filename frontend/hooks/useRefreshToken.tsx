import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import React from "react";

export const useRefreshTokenOnMount = () => {
  const { clearAccessToken, setAccessToken, setAuthResolved } = useAuthStore();

  React.useEffect(() => {
    const refresh = async () => {
      try {
        const res = await apiFetch("/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          clearAccessToken();
          if (res.status === 401) {
            console.log("No valid refresh token, skipping access token init.");
          }
          return;
        }
        setAccessToken(data.data.accessToken);
      } catch (err) {
        clearAccessToken();
      } finally {
        setAuthResolved(true);
      }
    };

    refresh();
  }, []);
};
