import { NextResponse } from "next/server";

export async function POST() {
  // Next step: Parse multipart/form-data, validate file size/type, then upload.
  return NextResponse.json(
    {
      message: "Upload endpoint placeholder",
      nextStep: "Implement parsing, validation, and provider upload logic.",
    },
    { status: 501 },
  );
}
