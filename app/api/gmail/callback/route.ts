import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchMutation, fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state") || "/dashboard/settings";

  const redirectToState = (gmail: string) => {
    const url = new URL(state, request.url);
    url.searchParams.set("gmail", gmail);
    return NextResponse.redirect(url);
  };

  if (error || !code) {
    return redirectToState("error");
  }

  const cookieStore = await cookies();
  const authToken = cookieStore.get("__convexAuthJWT")?.value;
  if (!authToken) {
    console.error("[gmail-callback] No Convex auth token in request cookies");
    return redirectToState("error");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return redirectToState("no_client");
  }

  const redirectUri = `${request.nextUrl.origin}/api/gmail/callback`;

  try {
    // Step 1: Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error(
        "[gmail-callback] Token exchange failed:",
        tokenResponse.status,
        errBody,
      );
      return redirectToState("error");
    }

    const tokens = await tokenResponse.json();

    // Step 2: Create inbox connection doc and get userId
    const { userId } = await fetchMutation(
      api.inboxConnections.connectGmail,
      { credentials: tokens },
      { token: authToken },
    );

    // Step 3: Setup Gmail — store account, start watch, persist historyId
    const result = await fetchAction(
      api.gmailAccounts.exchangeAndSetup,
      {
        userId,
        accessToken: tokens.access_token,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        expiresIn: tokens.expires_in ?? 3600,
      },
      { token: authToken },
    );

    console.log(
      `[gmail-callback] Connected ${result.gmailEmail} with historyId ${result.historyId}`,
    );

    return redirectToState("connected");
  } catch (err) {
    console.error("[gmail-callback]", err);
    return redirectToState("error");
  }
}
