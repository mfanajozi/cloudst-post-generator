export type PinType = "Affiliate Product" | "Service";
export type Platform = "pinterest" | "twitter" | "threads" | "linkedin";

export interface PinterestVariation {
  title: string;
  description: string;
  tags: string[];
  image_prompt?: string;
}

export interface TwitterVariation {
  tweet: string;
  thread?: string[];
  hashtags: string[];
}

export interface ThreadsVariation {
  hook: string;
  body: string;
  hashtags: string[];
}

export interface LinkedInVariation {
  headline: string;
  body: string;
  hashtags: string[];
  cta?: string;
}

export type SocialVariation = PinterestVariation | TwitterVariation | ThreadsVariation | LinkedInVariation;

export interface GenerateRequest {
  type: PinType;
  details: string;
  platform: Platform;
  niche?: string;
  targetAudience?: string;
  tone?: string;
  includeThread?: boolean;
  includeCTA?: boolean;
}

export interface GenerateResponse {
  variations: SocialVariation[];
  platform: Platform;
}
