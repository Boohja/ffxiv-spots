import { NextResponse } from "next/server";

import { deleteExpiredNotifications } from "@/lib/notifications/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const deleted = await deleteExpiredNotifications();

    return NextResponse.json({ deleted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not delete expired notifications." }, { status: 500 });
  }
}

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}
