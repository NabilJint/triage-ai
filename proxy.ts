import type { NextRequest, NextFetchEvent } from "next/server";
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher(["/", "/login", "/onboarding", "/callback", "/debug", "/ingest(.*)", "/api/scrape-summarize"]);

const authMiddleware = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuth = await convexAuth.isAuthenticated();
  const hasCode = request.nextUrl.searchParams.has("code");

  if (!isPublicPage(request) && !isAuth && !hasCode) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname.startsWith("/api/gmail/")) {
    return;
  }
  return authMiddleware(request, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
