import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/openrouter";
import { GenerateSchema, parseAndValidateJSON, validatePinterestVariation, validateTwitterVariation, validateThreadsVariation, validateLinkedInVariation, VariationValidated } from "@/lib/validators";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = GenerateSchema.safeParse(body);
    if (!validation.success) {
      const issues = validation.error.issues;
      return NextResponse.json(
        { error: issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const { type, details, platform, includeThread, includeCTA } = validation.data;

    const rawResponse = await generateContent(platform, type, details, { includeThread, includeCTA });

    const parsed = parseAndValidateJSON<unknown[]>(JSON.stringify(rawResponse));

    if (!parsed || !Array.isArray(parsed)) {
      return NextResponse.json(
        { error: "Failed to parse API response. Please try again." },
        { status: 500 }
      );
    }

    const variations: VariationValidated[] = [];

    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;

      const obj = item as Record<string, unknown>;
      let validated: VariationValidated | null = null;

      switch (platform) {
        case "pinterest":
          validated = validatePinterestVariation(obj);
          break;
        case "twitter":
          validated = validateTwitterVariation(obj);
          break;
        case "threads":
          validated = validateThreadsVariation(obj);
          break;
        case "linkedin":
          validated = validateLinkedInVariation(obj);
          break;
      }

      if (validated) {
        variations.push(validated);
      }
    }

    if (variations.length === 0) {
      return NextResponse.json(
        { error: "No valid variations generated. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ variations, platform });
  } catch (error) {
    console.error("Generate error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "API configuration error. Please check your API key." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate content. Please try again." },
      { status: 500 }
    );
  }
}
