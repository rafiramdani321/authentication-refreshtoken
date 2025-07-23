"use client";

import { useRefreshTokenOnMount } from "@/hooks/useRefreshToken";

export const RefreshAccessTokenEffect = () => {
  useRefreshTokenOnMount();
  return null;
};
