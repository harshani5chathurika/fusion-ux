import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.FIGMA_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/figma/callback`;

  if (!clientId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=figma_not_configured`);
  }

  const state = crypto.randomUUID();
  const figmaUrl = new URL("https://www.figma.com/oauth");
  figmaUrl.searchParams.set("client_id", clientId);
  figmaUrl.searchParams.set("redirect_uri", redirectUri);
  figmaUrl.searchParams.set("scope", "file_read");
  figmaUrl.searchParams.set("state", state);
  figmaUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(figmaUrl.toString());
}
