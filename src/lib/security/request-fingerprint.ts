import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function getRequestFingerprint(request: NextRequest) {
  const secret = process.env.INTERACTION_HASH_SECRET || "development-secret";
  const input = [
    getClientIp(request),
    request.headers.get("user-agent") || "unknown",
    request.headers.get("accept-language") || "unknown",
  ].join("|");

  return createHash("sha256").update(`${secret}:${input}`).digest("hex");
}
