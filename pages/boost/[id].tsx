import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Boost(): JSX.Element {
  const r = useRouter();
  const { id } = r.query;
  const postId = Array.isArray(id) ? id[0] : id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function checkout(): Promise<void> {
    if (!postId) return;
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post_id: postId }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to start checkout");
      window.location.href = j.url as string;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (postId) { /* could prefetch */ } }, [postId]);

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="text-xl font-extrabold">Pin your post for 24h for £0.99 🚀</h1>
      <p className="mt-2 text-sm text-zinc-400">Your post will show with a Boost badge and be pinned to the top while active.</p>
      <button onClick={checkout} disabled={loading} className="mt-4 rounded-full bg-orange-400 px-4 py-2 font-semibold text-orange-950 disabled:opacity-50">{loading ? "Starting…" : "Continue to Checkout"}</button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}