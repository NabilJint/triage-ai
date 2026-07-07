import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher(["/", "/login", "/onboarding", "/callback", "/debug", "/ingest(.*)", "/api/scrape-summarize"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuth = await convexAuth.isAuthenticated();
  const hasCode = request.nextUrl.searchParams.has("code");

  if (!isPublicPage(request) && !isAuth && !hasCode) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
}, { shouldHandleCode: () => false });

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
