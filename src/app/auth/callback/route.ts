import { NextResponse, type NextRequest } from "next/server";

import { upsertAppUserProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = getSafeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          await upsertAppUserProfile(supabase, user);
        } catch (profileError) {
          console.error("Failed to upsert app user profile.", profileError);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv || !forwardedHost) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
