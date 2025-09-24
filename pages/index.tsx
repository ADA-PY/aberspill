import Head from "next/head";
import { useEffect, useState } from "react";
import { supabaseClient } from "../utils/supabase";
import PostComposer from "../components/PostComposer";
import PostCard, { type Post } from "../components/PostCard";

export default function Home(): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) setPosts(data as any);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>AberSpill</title>
        <meta
          name="description"
          content="Aberystwyth Uni confessions and missed connections. 100% anonymous."
        />
      </Head>

      {/* Sticky reassurance bar */}
      <header className="sticky top-0 z-20">
        <div className="bg-emerald-500 text-emerald-950 text-xs sm:text-sm">
          <div className="container-feed py-1 text-center font-bold tracking-wide">
            100% Anonymous · No accounts · No names · Unfiltered truths
          </div>
        </div>
        <div className="border-b border-black/5 bg-white/70 backdrop-blur">
          <div className="container-feed flex items-center justify-between py-4">
            <div className="text-2xl font-extrabold neon-text">AberSpill</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container-feed my-8">
        <div className="card p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200/40 via-transparent to-emerald-200/40 pointer-events-none" />
          <div className="relative space-y-5">
            <h1 className="text-4xl font-extrabold tracking-tight neon-text">100% ANONYMOUS</h1>
            <p className="mx-auto max-w-xl text-lg font-semibold text-zinc-700">
              Confess. Gossip. Rant. Missed connections.{" "}
              <span className="text-pink-600">Spill it all, Aber.</span>
            </p>
            <p className="text-base text-zinc-500 italic">
              No accounts · No names · Unfiltered truths
            </p>
          </div>
        </div>
      </section>

      {/* Feed */}
      <main className="container-feed space-y-4">
        <PostComposer />
        {loading && <p className="text-sm text-zinc-500">Loading…</p>}
        <div className="space-y-3">
          {posts.map((p) => (
            <PostCard key={p.id} p={p} />
          ))}
        </div>
      </main>

      <footer className="container-feed px-4 pb-12 pt-10 text-center text-xs text-zinc-500">
        <span>© {new Date().getFullYear()} AberSpill</span>
      </footer>
    </>
  );
}