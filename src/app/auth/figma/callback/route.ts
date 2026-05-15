import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=figma_no_code`);
  }

  try {
    const clientId = process.env.FIGMA_CLIENT_ID!;
    const clientSecret = process.env.FIGMA_CLIENT_SECRET!;
    const redirectUri = `${appUrl}/auth/figma/callback`;

    // Exchange code for access token
    const tokenRes = await fetch("https://api.figma.com/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text().catch(() => "");
      console.error("Figma token exchange failed:", tokenRes.status, body);
      return NextResponse.redirect(`${appUrl}/login?error=figma_token_failed`);
    }

    const tokenData = await tokenRes.json();

    // Get Figma user info
    const userRes = await fetch("https://api.figma.com/v1/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${appUrl}/login?error=figma_user_failed`);
    }

    const figmaUser = await userRes.json();
    const email = figmaUser.email;

    if (!email) {
      return NextResponse.redirect(`${appUrl}/login?error=figma_no_email`);
    }

    const admin = createAdminClient();

    // Find or create Supabase user by email
    const { data: existingUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
    let supabaseUser = existingUsers?.users?.find((u) => u.email === email) ?? null;

    if (!supabaseUser) {
      const { data: { user }, error } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: figmaUser.handle ?? figmaUser.email,
          avatar_url: figmaUser.img_url,
          provider: "figma",
          figma_id: figmaUser.id,
        },
      });
      if (error || !user) {
        console.error("Figma create user error:", error?.message);
        return NextResponse.redirect(`${appUrl}/login?error=figma_create_failed`);
      }
      supabaseUser = user;
    }

    // Generate a magic link to sign the user in
    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${appUrl}/dashboard` },
    });

    if (linkError || !data.properties?.action_link) {
      return NextResponse.redirect(`${appUrl}/login?error=figma_session_failed`);
    }

    return NextResponse.redirect(data.properties.action_link);
  } catch {
    return NextResponse.redirect(`${appUrl}/login?error=figma_failed`);
  }
}
