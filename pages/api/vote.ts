import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseClient, supabaseService } from "../../utils/supabase";
import { hashIdentity } from "../../utils/hash";
import { enforceVoteLimits } from "../../utils/rateLimit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") { res.status(405).end(); return; }
  const { post_id, value } = req.body || {};
  if (!post_id || ![1, -1].includes(value)) { res.status(400).json({ error: "params" }); return; }
  const voter_hash = hashIdentity(req);

  try { await enforceVoteLimits(voter_hash); } catch (e: any) { res.status(429).json({ error: e.message }); return; }

  const { error: upErr } = await supabaseClient.from("votes").upsert({ post_id, voter_hash, value });
  if (upErr) { res.status(500).json({ error: upErr.message }); return; }

  const { data: agg, error: aggErr } = await supabaseClient.from("votes").select("value").eq("post_id", post_id);
  if (aggErr) { res.status(500).json({ error: aggErr.message }); return; }
  const score = (agg || []).reduce((s: number, v: any) => s + (v.value || 0), 0);

  // use service role if available to bypass RLS
  const admin = supabaseService ?? supabaseClient;
  const { error: updErr } = await admin.from("posts").update({ score }).eq("id", post_id);
  if (updErr) { res.status(500).json({ error: updErr.message }); return; }

  res.status(200).json({ score });
}
