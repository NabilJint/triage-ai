import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const jar = await cookies();
  const all: Record<string, string | undefined> = {};
  const names = [
    "__convexAuthJWT",
    "__convexAuthRefreshToken",
    "__convexAuthOAuthVerifier",
    "__Host-__convexAuthJWT",
    "__Host-__convexAuthRefreshToken",
    "__Host-__convexAuthOAuthVerifier",
    "next-auth.session-token",
  ];
  for (const name of names) {
    try {
      const c = jar.get(name);
      if (c) all[name] = c.value;
    } catch { }
  }
  return NextResponse.json({ cookies: all, names: names });
}
