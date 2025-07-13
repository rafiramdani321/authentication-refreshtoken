import { Request } from "express";

export function getClientInfo(req: Request) {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const userAgent = req.get("user-agent") || "unknown";

  return { ip, userAgent };
}
