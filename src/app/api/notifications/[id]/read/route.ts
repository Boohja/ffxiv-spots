import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in before reading notifications." }, { status: 401 });
  }

  const readAt = new Date();
  const deleteAt = new Date(readAt);
  deleteAt.setDate(deleteAt.getDate() + 30);

  const { error } = await supabase
    .from("notifications")
    .update({
      read_at: readAt.toISOString(),
      delete_at: deleteAt.toISOString(),
    })
    .eq("id", id)
    .eq("recipient", user.id)
    .is("read_at", null);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not mark notification as read." }, { status: 500 });
  }

  return NextResponse.json({ readAt: readAt.toISOString() });
}
