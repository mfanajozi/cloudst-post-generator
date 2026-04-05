import OpenAI from "openai";
import { Platform } from "./types";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

function getPlatformPrompt(platform: Platform): { system: string; user: (type: string, details: string, options?: { includeThread?: boolean; includeCTA?: boolean }) => string } {
  switch (platform) {
    case "pinterest":
      return {
        system: `You are an expert Pinterest marketing strategist specializing in creating viral pins. Generate exactly 3 unique Pinterest pin variations based on the provided product or service details.

For each variation, output a valid JSON object with:
- title: A catchy, SEO-optimized title (max 100 characters) that stops the scroll
- description: Start with a highly engaging hook in the FIRST 50 characters, then continue with the full description (aim for 150-300 characters total)
- tags: Exactly 5 relevant Pinterest keywords as an array of strings
- image_prompt: (ONLY for Services) A detailed, vivid prompt optimized for AI text-to-image generators. Include style, colors, composition, mood, and key visual elements.

Return ONLY a valid JSON array of 3 objects. No markdown, no code blocks, no explanations.`,
        user: (type, details) => `Create 3 Pinterest pin variations for: ${type}

Product/Service Details:
${details}

Remember:
- First 50 characters of description MUST be a scroll-stopping hook
- Use Pinterest-friendly keywords in tags
- For Services, include detailed image_prompt for AI image generation`,
      };

    case "twitter":
      return {
        system: `You are an expert Twitter/X content creator specializing in viral tweets. Generate exactly 3 unique tweet variations based on the provided product or service details.

For each variation, output a valid JSON object with:
- tweet: A punchy, engaging tweet (max 280 characters) that drives engagement. Use line breaks for readability. Start with a hook.
- hashtags: Exactly 3-5 relevant hashtags as an array of strings (without # symbol)
- thread: (OPTIONAL) If includeThread is true, add a thread array with 2-4 follow-up tweets that expand on the main tweet. Each thread tweet should be under 280 characters.

Return ONLY a valid JSON array of 3 objects. No markdown, no code blocks, no explanations.`,
        user: (type, details, options) => `Create 3 tweet variations for: ${type}

Product/Service Details:
${details}
${options?.includeThread ? "\n\nInclude a thread option for at least one variation." : ""}

Remember:
- Keep tweets under 280 characters
- Use line breaks for better readability
- Start with an attention-grabbing hook
- Include 3-5 relevant hashtags`,
      };

    case "threads":
      return {
        system: `You are an expert Threads (Meta) content creator specializing in viral posts. Generate exactly 3 unique Threads post variations based on the provided product or service details.

For each variation, output a valid JSON object with:
- hook: A compelling first line that stops the scroll (under 100 characters)
- body: The main content that expands on the hook. Use line breaks, emojis sparingly, and storytelling techniques. Aim for 200-500 characters.
- hashtags: Exactly 3-5 relevant hashtags as an array of strings (without # symbol)

Return ONLY a valid JSON array of 3 objects. No markdown, no code blocks, no explanations.`,
        user: (type, details) => `Create 3 Threads post variations for: ${type}

Product/Service Details:
${details}

Remember:
- Start with a powerful hook line
- Use storytelling and conversational tone
- Break content into readable paragraphs
- Include 3-5 relevant hashtags`,
      };

    case "linkedin":
      return {
        system: `You are an expert LinkedIn content creator specializing in professional, thought-leadership posts. Generate exactly 3 unique LinkedIn post variations based on the provided product or service details.

For each variation, output a valid JSON object with:
- headline: A professional, attention-grabbing headline/title (under 100 characters)
- body: Professional content that provides value. Use storytelling, insights, or tips. Include structure with line breaks. Aim for 300-600 characters.
- hashtags: Exactly 5-8 relevant LinkedIn hashtags as an array of strings (without # symbol)
- cta: (OPTIONAL) A call-to-action if includeCTA is true (e.g., "Share your thoughts in the comments", "DM for more info")

Return ONLY a valid JSON array of 3 objects. No markdown, no code blocks, no explanations.`,
        user: (type, details, options) => `Create 3 LinkedIn post variations for: ${type}

Product/Service Details:
${details}
${options?.includeCTA ? "\n\nInclude a call-to-action for each variation." : ""}

Remember:
- Write in professional, authoritative tone
- Use storytelling or provide valuable insights
- Structure content with line breaks
- Include 5-8 relevant hashtags`,
      };

    default:
      throw new Error("Invalid platform");
  }
}

export async function generateContent(
  platform: Platform,
  type: "Affiliate Product" | "Service",
  details: string,
  options?: { includeThread?: boolean; includeCTA?: boolean }
): Promise<unknown[]> {
  const { system, user } = getPlatformPrompt(platform);
  const primaryModel = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const fallbackModel = process.env.GROQ_FALLBACK_MODEL || "llama-3.3-70b-versatile";

  let response;
  try {
    response = await openai.chat.completions.create({
      model: primaryModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user(type, details, options) },
      ],
      temperature: 0.9,
      max_tokens: 3000,
    });
  } catch {
    try {
      response = await openai.chat.completions.create({
        model: fallbackModel,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user(type, details, options) },
        ],
        temperature: 0.9,
        max_tokens: 3000,
      });
    } catch {
      throw new Error("Both primary and fallback models failed");
    }
  }

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from Groq API");
  }

  const cleanedContent = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleanedContent);
}
