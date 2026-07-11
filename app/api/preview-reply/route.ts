import { NextRequest, NextResponse } from "next/server";
import { generateReplyPreview } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { tone, businessContext } = await request.json();
    if (!tone || typeof tone !== "string") {
      return NextResponse.json(
        { error: "tone is required" },
        { status: 400 },
      );
    }

    const preview = await generateReplyPreview(tone, businessContext ?? null);
    return NextResponse.json(preview);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
