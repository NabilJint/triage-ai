import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const origin = request.nextUrl.searchParams.get("state") || "/dashboard/settings";
    const redirectUrl = new URL(origin, request.url);
    redirectUrl.searchParams.set("gmail", "no_client");
    return NextResponse.redirect(redirectUrl);
  }

  const state = request.nextUrl.searchParams.get("state") || "/dashboard/settings";
  const redirectUri = `${request.nextUrl.origin}/api/gmail/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
