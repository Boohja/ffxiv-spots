import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function getSafeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const next = getSafeNext(searchParams.get("next"));
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: "identify",
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/auth/error?reason=oauth_start_failed`);
  }

  return NextResponse.redirect(data.url);
}
