import Link from "next/link";
import dayjs from "../utils/date";
import BadgeBoosted from "./BadgeBoosted";
import { useState } from "react";

export type Post = {
  id: string;
  body: string;
  tag: "confession" | "missed" | "meme" | "rant";
  score: number;
  replies_count: number;
  boosted_until?: string | null;
  created_at: string;
};

const Up = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M5 12l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const Down = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M15 8l-5 5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PostCard({ p, isOwner }: { p: Post; isOwner?: boolean }): JSX.Element {
  const [score, setScore] = useState(p.score);

  async function vote(v: 1 | -1): Promise<void> {
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: p.id, value: v })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as any).error || "Vote failed");
      setScore(j.score);
    } catch (e) {
      console.error("vote error", e);
    }
  }

  return (
    <div className="card lift p-5">
      <div className="mb-2 flex items-center justify-between text-[12px] text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="pill bg-zinc-100 capitalize text-zinc-700">{p.tag}</span>
          <span>{dayjs(p.created_at).fromNow()}</span>
          <BadgeBoosted until={p.boosted_until || undefined} />
        </div>
        <Link href={`/p/${p.id}`} className="pill bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition">
          {p.replies_count} {p.replies_count === 1 ? "reply" : "replies"}
        </Link>
      </div>

      <Link href={`/p/${p.id}`}>
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{p.body}</p>
      </Link>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => vote(1)} className="h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 inline-flex items-center justify-center transition">
            <Up />
          </button>
          <span className="min-w-6 text-center num">{score}</span>
          <button onClick={() => vote(-1)} className="h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 inline-flex items-center justify-center transition">
            <Down />
          </button>
        </div>
        {isOwner ? (
          <Link href={`/boost/${p.id}`} className="btn-ghost">Boost</Link>
        ) : <span />}
      </div>
    </div>
  );
}