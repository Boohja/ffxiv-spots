import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { uploadImageFile, UploadValidationError } from "@/lib/uploads/storage";

export const runtime = "nodejs";

const maxFiles = 6;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in before uploading images." }, { status: 401 });
    }

    const formData = await request.formData();
    const folder = stringValue(formData.get("folder"));
    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Attach at least one image using the images field." }, { status: 400 });
    }

    if (files.length > maxFiles) {
      return NextResponse.json({ error: `Upload at most ${maxFiles} images at a time.` }, { status: 400 });
    }

    const uploads = await Promise.all(files.map((file) => uploadImageFile(file, { folder })));

    return NextResponse.json({ uploads }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
