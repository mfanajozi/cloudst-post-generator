"use client";

import { useState, useCallback } from "react";
import { Sparkles, Copy, Check, Palette, FileText, Wand2, AlertCircle, MessageCircle, Link2, Image as ImageIcon, Square } from "lucide-react";
import { Platform } from "@/lib/types";
import { VariationValidated, PinterestVariationValidated, TwitterVariationValidated, ThreadsVariationValidated, LinkedInVariationValidated } from "@/lib/validators";

interface Toast {
  message: string;
  type: "success" | "error";
}

const platformConfig = {
  pinterest: {
    name: "Pinterest",
    icon: Sparkles,
    color: "#e60023",
    description: "Create viral pins with titles, descriptions, and tags",
  },
  twitter: {
    name: "X (Twitter)",
    icon: MessageCircle,
    color: "#1DA1F2",
    description: "Generate engaging tweets and optional threads",
  },
  threads: {
    name: "Threads",
    icon: ImageIcon,
    color: "#000000",
    description: "Create scroll-stopping Threads posts",
  },
  linkedin: {
    name: "LinkedIn",
    icon: Link2,
    color: "#0A66C2",
    description: "Professional thought-leadership posts",
  },
};

export default function Home() {
  const [platform, setPlatform] = useState<Platform>("pinterest");
  const [type, setType] = useState<"Affiliate Product" | "Service">("Affiliate Product");
  const [details, setDetails] = useState("");
  const [includeThread, setIncludeThread] = useState(false);
  const [includeCTA, setIncludeCTA] = useState(false);
  const [variations, setVariations] = useState<VariationValidated[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [error, setError] = useState("");

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setVariations([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, details, platform, includeThread, includeCTA }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content");
      }

      setVariations(data.variations);
      showToast(`${platformConfig[platform].name} content generated!`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      showToast("Copied to clipboard!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const getPlatformIcon = (p: Platform) => {
    const Icon = platformConfig[p].icon;
    return <Icon className="w-5 h-5" />;
  };

  const renderPinterestVariation = (v: PinterestVariationValidated, index: number) => (
    <div key={index} className="glass-card rounded-3xl p-6 space-y-5" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-white leading-tight flex-1">{v.title}</h3>
          <button
            onClick={() => copyToClipboard(v.title, `title-${index}`)}
            className={`copy-btn p-2 rounded-lg ${copiedIndex === `title-${index}` ? "copied" : ""}`}
          >
            {copiedIndex === `title-${index}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-sm text-white/70">
          <span className="text-[#ffd300] font-semibold">{v.description.slice(0, 50)}</span>
          {v.description.slice(50)}
        </p>
        <button
          onClick={() => copyToClipboard(v.description, `desc-${index}`)}
          className={`copy-btn p-2 rounded-lg ${copiedIndex === `desc-${index}` ? "copied" : ""}`}
        >
          {copiedIndex === `desc-${index}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span># Tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {v.tags.map((tag, tagIndex) => (
            <button
              key={tagIndex}
              onClick={() => copyToClipboard(tag, `tag-${index}-${tagIndex}`)}
              className={`tag-badge px-3 py-1 rounded-full text-xs font-medium ${copiedIndex === `tag-${index}-${tagIndex}` ? "copied" : ""}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {v.image_prompt && (
        <div className="space-y-2">
          <div className="image-prompt-label text-sm flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            AI Image Prompt
          </div>
          <div className="image-prompt-box">
            <p className="text-sm text-white/80 leading-relaxed">{v.image_prompt}</p>
          </div>
          <button
            onClick={() => copyToClipboard(v.image_prompt!, `prompt-${index}`)}
            className={`copy-btn p-2 rounded-lg w-full flex items-center justify-center gap-2 ${copiedIndex === `prompt-${index}` ? "copied" : ""}`}
          >
            {copiedIndex === `prompt-${index}` ? <><Check className="w-4 h-4" /><span className="text-sm">Copied!</span></> : <><Copy className="w-4 h-4" /><span className="text-sm">Copy Prompt</span></>}
          </button>
        </div>
      )}

      <button
        onClick={() => {
          const fullContent = [`Title: ${v.title}`, `Description: ${v.description}`, `Tags: ${v.tags.map(t => `#${t}`).join(", ")}`, v.image_prompt ? `Image Prompt: ${v.image_prompt}` : ""].filter(Boolean).join("\n\n");
          copyToClipboard(fullContent, `all-${index}`);
        }}
        className="btn-primary w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy All
      </button>
    </div>
  );

  const renderTwitterVariation = (v: TwitterVariationValidated, index: number) => (
    <div key={index} className="glass-card rounded-3xl p-6 space-y-5" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-start gap-2">
        <MessageCircle className="w-5 h-5 text-[#1DA1F2] mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{v.tweet}</p>
        </div>
        <button
          onClick={() => copyToClipboard(v.tweet, `tweet-${index}`)}
          className={`copy-btn p-2 rounded-lg ${copiedIndex === `tweet-${index}` ? "copied" : ""}`}
        >
          {copiedIndex === `tweet-${index}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {v.hashtags.map((tag, tagIndex) => (
          <button
            key={tagIndex}
            onClick={() => copyToClipboard(`#${tag}`, `htag-${index}-${tagIndex}`)}
            className={`tag-badge px-3 py-1 rounded-full text-xs font-medium ${copiedIndex === `htag-${index}-${tagIndex}` ? "copied" : ""}`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {v.thread && v.thread.length > 0 && (
        <div className="space-y-2 border-t border-white/10 pt-4">
          <p className="text-sm text-white/60">Thread ({v.thread.length} tweets):</p>
          {v.thread.map((tweet, tweetIndex) => (
            <div key={tweetIndex} className="bg-white/5 rounded-lg p-3 text-sm text-white/80">
              <p className="leading-relaxed">{tweet}</p>
              <button
                onClick={() => copyToClipboard(tweet, `thread-${index}-${tweetIndex}`)}
                className={`copy-btn p-1 rounded mt-2 ${copiedIndex === `thread-${index}-${tweetIndex}` ? "copied" : ""}`}
              >
                {copiedIndex === `thread-${index}-${tweetIndex}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          let fullContent = v.tweet + "\n\n" + v.hashtags.map(t => `#${t}`).join(" ");
          if (v.thread) {
            fullContent += "\n\n--- Thread ---\n" + v.thread.join("\n\n");
          }
          copyToClipboard(fullContent, `all-${index}`);
        }}
        className="btn-primary w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy All
      </button>
    </div>
  );

  const renderThreadsVariation = (v: ThreadsVariationValidated, index: number) => (
    <div key={index} className="glass-card rounded-3xl p-6 space-y-5" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <ImageIcon className="w-5 h-5 text-white/60 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[#ffd300] font-bold text-lg leading-tight">{v.hook}</p>
          </div>
        </div>
        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{v.body}</p>
        <button
          onClick={() => copyToClipboard(v.hook + "\n\n" + v.body, `body-${index}`)}
          className={`copy-btn p-2 rounded-lg ${copiedIndex === `body-${index}` ? "copied" : ""}`}
        >
          {copiedIndex === `body-${index}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {v.hashtags.map((tag, tagIndex) => (
          <button
            key={tagIndex}
            onClick={() => copyToClipboard(`#${tag}`, `htag-${index}-${tagIndex}`)}
            className={`tag-badge px-3 py-1 rounded-full text-xs font-medium ${copiedIndex === `htag-${index}-${tagIndex}` ? "copied" : ""}`}
          >
            #{tag}
          </button>
        ))}
      </div>

      <button
        onClick={() => copyToClipboard(v.hook + "\n\n" + v.body + "\n\n" + v.hashtags.map(t => `#${t}`).join(" "), `all-${index}`)}
        className="btn-primary w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy All
      </button>
    </div>
  );

  const renderLinkedInVariation = (v: LinkedInVariationValidated, index: number) => (
    <div key={index} className="glass-card rounded-3xl p-6 space-y-5" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Link2 className="w-5 h-5 text-[#0A66C2] mt-1 flex-shrink-0" />
          <h3 className="text-lg font-bold text-white leading-tight flex-1">{v.headline}</h3>
          <button
            onClick={() => copyToClipboard(v.headline, `headline-${index}`)}
            className={`copy-btn p-2 rounded-lg ${copiedIndex === `headline-${index}` ? "copied" : ""}`}
          >
            {copiedIndex === `headline-${index}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{v.body}</p>
        <button
          onClick={() => copyToClipboard(v.body, `body-${index}`)}
          className={`copy-btn p-2 rounded-lg ${copiedIndex === `body-${index}` ? "copied" : ""}`}
        >
          {copiedIndex === `body-${index}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {v.hashtags.map((tag, tagIndex) => (
          <button
            key={tagIndex}
            onClick={() => copyToClipboard(`#${tag}`, `htag-${index}-${tagIndex}`)}
            className={`tag-badge px-3 py-1 rounded-full text-xs font-medium ${copiedIndex === `htag-${index}-${tagIndex}` ? "copied" : ""}`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {v.cta && (
        <div className="bg-[#0A66C2]/20 border border-[#0A66C2]/30 rounded-lg p-3">
          <p className="text-sm text-white/80"><span className="text-[#0A66C2] font-medium">CTA:</span> {v.cta}</p>
          <button
            onClick={() => copyToClipboard(v.cta!, `cta-${index}`)}
            className={`copy-btn p-1 rounded mt-2 ${copiedIndex === `cta-${index}` ? "copied" : ""}`}
          >
            {copiedIndex === `cta-${index}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      )}

      <button
        onClick={() => copyToClipboard(v.headline + "\n\n" + v.body + "\n\n" + v.hashtags.map(t => `#${t}`).join(" ") + (v.cta ? "\n\n" + v.cta : ""), `all-${index}`)}
        className="btn-primary w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy All
      </button>
    </div>
  );

  const renderVariation = (v: VariationValidated, index: number) => {
    switch (v.type) {
      case "pinterest":
        return renderPinterestVariation(v, index);
      case "twitter":
        return renderTwitterVariation(v, index);
      case "threads":
        return renderThreadsVariation(v, index);
      case "linkedin":
        return renderLinkedInVariation(v, index);
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="gradient-mesh">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
        <div className="gradient-orb gradient-orb-4" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-[#e60023] pin-icon animate-pulse" />
              <div className="absolute inset-0 w-12 h-12 bg-[#e60023] rounded-full blur-xl opacity-30 animate-ping" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 title-glow">
            <span className="bg-gradient-to-r from-[#e60023] via-[#ff6b35] to-[#ffd300] bg-clip-text text-transparent">
              SineThamsanqa
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#ffd300] via-[#1DA1F2] to-[#7c1d2c] bg-clip-text text-transparent">
              Business Solutions
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            AI-Powered Content Generator for Pinterest, X, Threads & LinkedIn
          </p>
        </header>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-16">
          <div className="glass-card rounded-3xl p-8 space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                Platform
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.keys(platformConfig) as Platform[]).map((p) => {
                  const config = platformConfig[p];
                  const Icon = config.icon;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        platform === p
                          ? "border-white/50 bg-white/10"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <Icon className="w-6 h-6" style={{ color: config.color }} />
                      <span className="text-xs text-white/80">{config.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Palette className="w-4 h-4" />
                Content Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as "Affiliate Product" | "Service")}
                className="select-field w-full px-4 py-3 rounded-xl text-white"
              >
                <option value="Affiliate Product">Affiliate Product</option>
                <option value="Service">Service</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="details" className="flex items-center gap-2 text-sm font-medium text-white/80">
                <FileText className="w-4 h-4" />
                Product / Service Details
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={platform === "pinterest" 
                  ? "Name, key features, target audience, price, unique selling points..."
                  : platform === "twitter"
                  ? "Product/service name, key benefits, what makes it unique, target audience..."
                  : platform === "threads"
                  ? "Product/service name, story angle, key points to cover, target audience..."
                  : "Product/service name, industry insights, professional angle, target audience..."
                }
                className="input-field w-full px-4 py-3 rounded-xl text-white min-h-[150px] resize-y"
                required
                minLength={10}
              />
              <p className="text-xs text-white/40">
                {details.length}/2000 characters (minimum 10)
              </p>
            </div>

            {platform === "twitter" && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeThread}
                    onChange={(e) => setIncludeThread(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-[#1DA1F2] focus:ring-[#1DA1F2]"
                  />
                  <span className="text-sm text-white/80">Include thread option</span>
                </label>
              </div>
            )}

            {platform === "linkedin" && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCTA}
                    onChange={(e) => setIncludeCTA(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-[#0A66C2] focus:ring-[#0A66C2]"
                  />
                  <span className="text-sm text-white/80">Include call-to-action</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || details.length < 10}
              className="btn-primary w-full py-4 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate 3 {platformConfig[platform].name} Variations</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-3xl p-6 space-y-4">
                <div className="skeleton h-8 rounded-lg" />
                <div className="space-y-2">
                  <div className="skeleton h-4 rounded w-full" />
                  <div className="skeleton h-4 rounded w-4/5" />
                  <div className="skeleton h-4 rounded w-3/5" />
                </div>
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                  <div className="skeleton h-6 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {variations.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-3">
              {getPlatformIcon(platform)}
              <h2 className="text-2xl md:text-3xl font-bold text-center">
                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Your Generated {platformConfig[platform].name} Posts
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {variations.map((v, index) => renderVariation(v, index))}
            </div>
          </div>
        )}

        {variations.length === 0 && !isLoading && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
              <Palette className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white/60 mb-2">
              Ready to Create Viral Content
            </h3>
            <p className="text-white/40">
              Select a platform, fill in the details, and click generate
            </p>
          </div>
        )}
      </div>

      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          <div className="flex items-center gap-3">
            {toast.type === "error" ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <footer className="relative z-10 text-center py-8 text-white/30 text-sm">
        © 2024 SineThamsanqa Business Solutions. Powered by AI & OpenRouter
      </footer>
    </div>
  );
}
