import { supabaseClient } from "./supabase";

export async function enforcePostLimits(ipHash: string): Promise<void> {
  const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const sinceMinute = new Date(Date.now() - 60 * 1000).toISOString();
  const { count: dayCount, error: e1 } = await supabaseClient
    .from("posts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sinceDay)
    .eq("ip_hash", ipHash);
  if (e1) throw e1;
  if ((dayCount ?? 0) >= 5) throw new Error("rate: posts/day");
  const { count: recentCount } = await supabaseClient
    .from("posts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sinceMinute)
    .eq("ip_hash", ipHash);
  if ((recentCount ?? 0) > 0) throw new Error("rate: 1 per minute");
}

export async function enforceReplyLimits(ipHash: string): Promise<void> {
  const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since15 = new Date(Date.now() - 15 * 1000).toISOString();
  const { count: dayCount } = await supabaseClient
    .from("replies")
    .select("id", { head: true, count: "exact" })
    .gte("created_at", sinceDay)
    .eq("ip_hash", ipHash);
  if ((dayCount ?? 0) >= 20) throw new Error("rate: replies/day");
  const { count: recentCount } = await supabaseClient
    .from("replies")
    .select("id", { head: true, count: "exact" })
    .gte("created_at", since15)
    .eq("ip_hash", ipHash);
  if ((recentCount ?? 0) > 0) throw new Error("rate: 1 per 15s");
}

export async function enforceVoteLimits(ipHash: string): Promise<void> {
  const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since2 = new Date(Date.now() - 2 * 1000).toISOString();
  const { count: dayCount } = await supabaseClient
    .from("votes")
    .select("voter_hash", { head: true, count: "exact" })
    .gte("created_at", sinceDay)
    .eq("voter_hash", ipHash);
  if ((dayCount ?? 0) >= 60) throw new Error("rate: votes/day");
  const { count: recentCount } = await supabaseClient
    .from("votes")
    .select("voter_hash", { head: true, count: "exact" })
    .gte("created_at", since2)
    .eq("voter_hash", ipHash);
  if ((recentCount ?? 0) > 0) throw new Error("rate: 1 per 2s");
}
