import { NextResponse } from "next/server";

import { isMissingRelationError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ count: 0 }, { status: 401 });
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient", user.id)
    .is("read_at", null);

  if (error) {
    if (isMissingRelationError(error, "notifications")) {
      return NextResponse.json({ count: 0 });
    }

    console.error(error);
    return NextResponse.json({ error: "Could not count notifications." }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
