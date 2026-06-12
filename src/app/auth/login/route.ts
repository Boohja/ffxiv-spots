import { NextResponse, type NextRequest } from "next/server";

import { getSiteUrl } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirectOrigin = getTrustedRedirectOrigin(request);
  const next = getSafeNext(searchParams.get("next"));
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${redirectOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: "identify",
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${redirectOrigin}/auth/error?reason=oauth_start_failed`);
  }

  return NextResponse.redirect(data.url);
}

function getTrustedRedirectOrigin(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return request.nextUrl.origin;
  }

  return getSiteUrl().origin;
}
