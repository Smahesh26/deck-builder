import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import cookie from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send("Missing code");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
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

  // Fix: Explicitly type tokenData
  const tokenData: { access_token?: string } = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return res.status(401).send("Failed to get access token");
  }

  // Fetch user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const user = await userRes.json();

  // Set cookie with email (for demo; use secure session in production)
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("userEmail", user.email, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  );

  // Redirect to dashboard
  res.redirect("/dashboard");
}
