import { RequestInit } from "next/dist/server/web/spec-extension/request";

export const apiFetch = async (url: string, options?: RequestInit) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${base}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    credentials: "include",
  });

  return res;
};
