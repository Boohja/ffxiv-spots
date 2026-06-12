import { NextResponse, type NextRequest } from "next/server";

import {
  getDiscordAccessConfig,
  getDiscordLoginFailureReason,
  type DiscordAccessProfile,
} from "@/lib/auth/discord-access";
import { upsertAppUserProfile } from "@/lib/auth/profile";
import { getSiteUrl } from "@/lib/metadata";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirectOrigin = getTrustedRedirectOrigin(request);
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
        const profile = await getAppUserAccessProfile(supabase, user.id);
        const failureReason = getDiscordLoginFailureReason(profile, getDiscordAccessConfig());

        if (failureReason) {
          await supabase.auth.signOut();

          return NextResponse.redirect(`${redirectOrigin}/auth/error?reason=${failureReason}`);
        }

        try {
          await upsertAppUserProfile(createAdminClient(), user);
        } catch (profileError) {
          console.error("Failed to upsert app user profile.", profileError);
        }
      }

      return NextResponse.redirect(`${redirectOrigin}${next}`);
    }
  }

  return NextResponse.redirect(`${redirectOrigin}/auth/error`);
}

function getTrustedRedirectOrigin(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return request.nextUrl.origin;
  }

  return getSiteUrl().origin;
}

async function getAppUserAccessProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("app_users")
    .select("role")
    .eq("id", userId)
    .maybeSingle<DiscordAccessProfile>();

  if (error) {
    throw error;
  }

  return data;
}
