import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  return updateLike(context, true);
}

export async function DELETE(_request: Request, context: RouteContext) {
  return updateLike(context, false);
}

async function updateLike(context: RouteContext, shouldLike: boolean) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in to like spots." }, { status: 401 });
    }

    const { data: spot, error: spotError } = await supabase
      .from("spots")
      .select("id, state")
      .eq("id", id)
      .maybeSingle<{ id: string; state: string }>();

    if (spotError) {
      throw spotError;
    }

    if (!spot || spot.state !== "accepted") {
      return NextResponse.json({ error: "Spot not found." }, { status: 404 });
    }

    if (shouldLike) {
      const { error } = await supabase
        .from("spot_likes")
        .upsert(
          { spot_id: spot.id, user_id: user.id },
          { ignoreDuplicates: true, onConflict: "spot_id,user_id" },
        );

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase
        .from("spot_likes")
        .delete()
        .eq("spot_id", spot.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }
    }

    const likeCount = await getLikeCount(supabase, spot.id);

    return NextResponse.json({
      liked: shouldLike,
      likeCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update like." }, { status: 500 });
  }
}

async function getLikeCount(supabase: Awaited<ReturnType<typeof createClient>>, spotId: string) {
  const { data, error } = await supabase
    .from("spots")
    .select("like_count")
    .eq("id", spotId)
    .single<{ like_count: number }>();

  if (error) {
    throw error;
  }

  return data.like_count;
}
