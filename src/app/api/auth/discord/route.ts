import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // TODO: Validate `code`, exchange it for Discord tokens, then create a session.
  return NextResponse.json(
    {
      message: "Discord auth callback placeholder",
      code,
      nextStep: "Implement OAuth code exchange and session handling.",
    },
    { status: 501 },
  );
}
