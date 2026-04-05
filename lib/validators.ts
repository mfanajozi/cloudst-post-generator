import { z } from "zod";

export const GenerateSchema = z.object({
  type: z.enum(["Affiliate Product", "Service"], {
    error: "Please select a type",
  }),
  details: z
    .string()
    .min(10, "Please provide at least 10 characters of details")
    .max(2000, "Details must be under 2000 characters"),
  platform: z.enum(["pinterest", "twitter", "threads", "linkedin"], {
    error: "Please select a platform",
  }),
  niche: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  includeThread: z.boolean().optional(),
  includeCTA: z.boolean().optional(),
});

export type GenerateInput = z.infer<typeof GenerateSchema>;

export function parseAndValidateJSON<T>(jsonString: string): T | null {
  try {
    const cleaned = jsonString
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed as T;
  } catch {
    return null;
  }
}

export interface PinterestVariationValidated {
  type: "pinterest";
  title: string;
  description: string;
  tags: string[];
  image_prompt?: string;
}

export interface TwitterVariationValidated {
  type: "twitter";
  tweet: string;
  thread?: string[];
  hashtags: string[];
}

export interface ThreadsVariationValidated {
  type: "threads";
  hook: string;
  body: string;
  hashtags: string[];
}

export interface LinkedInVariationValidated {
  type: "linkedin";
  headline: string;
  body: string;
  hashtags: string[];
  cta?: string;
}

export type VariationValidated = PinterestVariationValidated | TwitterVariationValidated | ThreadsVariationValidated | LinkedInVariationValidated;

export function validatePinterestVariation(obj: Record<string, unknown>): PinterestVariationValidated | null {
  if (typeof obj.title !== "string" || obj.title.length > 100) return null;
  if (typeof obj.description !== "string") return null;
  if (!Array.isArray(obj.tags) || obj.tags.length > 5) return null;
  if (!obj.tags.every((tag) => typeof tag === "string")) return null;

  const validated: PinterestVariationValidated = {
    type: "pinterest",
    title: obj.title.trim(),
    description: obj.description.trim(),
    tags: obj.tags.map((tag: unknown) => String(tag).trim()).filter((tag) => tag.length > 0),
  };

  if (obj.image_prompt !== undefined && typeof obj.image_prompt === "string") {
    validated.image_prompt = obj.image_prompt.trim();
  }

  return validated;
}

export function validateTwitterVariation(obj: Record<string, unknown>): TwitterVariationValidated | null {
  if (typeof obj.tweet !== "string") return null;
  const validated: TwitterVariationValidated = {
    type: "twitter",
    tweet: obj.tweet.trim(),
    hashtags: Array.isArray(obj.hashtags) ? obj.hashtags.map((t: unknown) => String(t).trim()).filter((t) => t.length > 0) : [],
  };

  if (obj.thread && Array.isArray(obj.thread)) {
    validated.thread = obj.thread.filter((t: unknown) => typeof t === "string").map((t: unknown) => String(t).trim());
  }

  return validated;
}

export function validateThreadsVariation(obj: Record<string, unknown>): ThreadsVariationValidated | null {
  if (typeof obj.hook !== "string") return null;
  if (typeof obj.body !== "string") return null;
  if (!Array.isArray(obj.hashtags)) return null;

  return {
    type: "threads",
    hook: obj.hook.trim(),
    body: obj.body.trim(),
    hashtags: obj.hashtags.map((t) => String(t).trim()).filter((t) => t.length > 0),
  };
}

export function validateLinkedInVariation(obj: Record<string, unknown>): LinkedInVariationValidated | null {
  if (typeof obj.headline !== "string") return null;
  if (typeof obj.body !== "string") return null;
  if (!Array.isArray(obj.hashtags)) return null;

  const validated: LinkedInVariationValidated = {
    type: "linkedin",
    headline: obj.headline.trim(),
    body: obj.body.trim(),
    hashtags: obj.hashtags.map((t) => String(t).trim()).filter((t) => t.length > 0),
  };

  if (obj.cta !== undefined && typeof obj.cta === "string") {
    validated.cta = obj.cta.trim();
  }

  return validated;
}
