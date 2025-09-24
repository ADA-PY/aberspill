import { useMemo, useState } from "react";
import Toast from "./Toast";

const TAGS = [
  { key: "confession", label: "Confession" },
  { key: "missed", label: "Missed" },
  { key: "meme", label: "Meme" },
  { key: "rant", label: "Rant" }
] as const;

export default function PostComposer(): JSX.Element {
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<typeof TAGS[number]["key"]>("confession");
  const [toast, setToast] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [website_url, setWebsiteUrl] = useState(""); // honeypot

  const len = body.trim().length;
  const valid = len >= 3 && len <= 500;

  const ring = useMemo(() => {
    const pct = Math.min(100, Math.round((len/500)*100));
    const c = 2 * Math.PI * 18;
    const offset = c - (pct/100)*c;
    const col = !valid && len>0 ? "#ef4444" : (len>440 ? "#f59e0b" : "#10b981");
    return { offset, col };
  }, [len, valid]);

  async function submit(): Promise<void> {
    if (loading || !valid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, tag, website_url })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Failed");
      setBody("");
      setToast("Posted");
    } catch (e: any) {
      console.error("submit error", e);
      setToast(e?.message || "Failed");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(undefined), 1800);
    }
  }

  return (
    <div className="card p-5 card-grid">
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={500}
          placeholder="Spill the tea... (3–500 chars)"
          className="ring-focus w-full resize-none rounded-xl bg-white/70 p-4 leading-relaxed outline-none placeholder:text-zinc-400"
        />
        {/* circular progress */}
        <svg width="44" height="44" viewBox="0 0 44 44" className="absolute bottom-2 right-2">
          <circle cx="22" cy="22" r="18" stroke="rgba(0,0,0,.08)" strokeWidth="4" fill="none" />
          <circle cx="22" cy="22" r="18" stroke={ring.col} strokeWidth="4" fill="none"
                  strokeDasharray={2*Math.PI*18} strokeDashoffset={ring.offset}
                  strokeLinecap="round" transform="rotate(-90 22 22)" />
          <text x="22" y="26" textAnchor="middle" fontSize="10" fill="#52525b">{len}</text>
        </svg>
      </div>

      {/* Honeypot */}
      <input value={website_url} onChange={(e) => setWebsiteUrl(e.target.value)} className="hidden" name="website_url" />

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          {TAGS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTag(t.key)}
              className={`pill text-sm ring-focus ${tag===t.key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={submit} disabled={loading || !valid} className="btn-brand">
          {loading ? "Posting…" : "Post"}
        </button>
      </div>
      <Toast message={toast} />
    </div>
  );
}