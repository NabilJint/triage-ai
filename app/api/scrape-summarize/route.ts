import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/scraper";
import { summarize } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json(
        { error: "Invalid URL protocol" },
        { status: 400 }
      );
    }

    const { content, businessName } = await scrapeWebsite(url);

    if (!content) {
      return NextResponse.json({
        summary: "",
        businessName,
        note: "Website content could not be extracted (JS-rendered or no readable text). Type your business details manually.",
      });
    }

    const summary = await summarize(content);

    return NextResponse.json({
      summary,
      businessName,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
