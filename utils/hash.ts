import crypto from "crypto";
import type { NextApiRequest } from "next";

export function getIP(req: NextApiRequest): string {
  const xff = (req.headers["x-forwarded-for"] || "") as string;
  const ip = xff
    ? xff.split(",").map((s) => s.trim()).pop()!
    : (req.headers["x-real-ip"] as string) || req.socket.remoteAddress || "0.0.0.0";
  return String(ip);
}

export function hashIdentity(req: NextApiRequest): string {
  const ip = getIP(req);
  const ua = (req.headers["user-agent"] || "unknown").toString();
  const salt = process.env.HASH_SALT || "change-me";
  const h = crypto.createHash("sha256").update(ip + "|" + ua + "|" + salt).digest("hex");
  return h;
}
