import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabaseClient } from "../../utils/supabase";
import PostCard, { type Post } from "../../components/PostCard";

export default function PostDetail(): JSX.Element {
  const r = useRouter();
  const { id } = r.query;
  const postId = Array.isArray(id) ? id[0] : id;

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyBody, setReplyBody] = useState("");

  useEffect(() => {
    if (!postId) return;
    (async () => {
      const { data } = await supabaseClient.from("posts").select("*").eq("id", postId).single();
      setPost(data as any);
      const { data: rs } = await supabaseClient
        .from("replies")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
      setReplies(rs || []);
    })();
  }, [postId]);

  async function addReply(): Promise<void> {
    if (!postId) return;
    const res = await fetch("/api/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, body: replyBody })
    });
    const j = await res.json();
    if (res.ok) {
      setReplyBody("");
      setReplies((prev) => [j.reply, ...prev]);
    } else alert(j.error || "Failed");
  }

  if (!post) return <div className="p-4">Loading…</div>;

  return (
    <div className="mx-auto max-w-xl p-4">
      <PostCard p={post} isOwner={false} />
      <div className="mt-6">
        <h3 className="mb-2 text-sm font-semibold text-zinc-300">Replies</h3>
        <div className="space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="rounded-2xl bg-zinc-900 p-3">
              <div className="mb-1 text-xs text-zinc-500">{new Date(r.created_at).toLocaleString()}</div>
              <p className="whitespace-pre-wrap text-[15px]">{r.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-zinc-900 p-3">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Write a reply…"
            className="w-full resize-none rounded-xl bg-zinc-950 p-3 outline-none"
          />
          <div className="mt-2 flex justify-end">
            <button onClick={addReply} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950">Reply</button>
          </div>
        </div>
      </div>
    </div>
  );
}