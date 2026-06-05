import { NextResponse } from "next/server";

export async function POST(_request: Request) {
  // TODO: Parse multipart/form-data, validate file size/type, upload to storage.
  return NextResponse.json(
    {
      message: "Upload endpoint placeholder",
      nextStep: "Implement parsing, validation, and provider upload logic.",
    },
    { status: 501 },
  );
}
