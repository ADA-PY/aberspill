import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseClient } from "../../utils/supabase";
import { hashIdentity } from "../../utils/hash";
import { enforceReplyLimits } from "../../utils/rateLimit";
import { countLinks, isSpammy } from "../../utils/spam";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") { res.status(405).end(); return; }
  const { post_id, body } = req.body || {};
  if (!post_id) { res.status(400).json({ error: "post_id" }); return; }
  if (typeof body !== "string" || body.trim().length < 1 || body.length > 300) { res.status(400).json({ error: "length" }); return; }
  if (countLinks(body) > 1 || isSpammy(body)) { res.status(400).json({ error: "spam" }); return; }

  const ip_hash = hashIdentity(req);
  try { await enforceReplyLimits(ip_hash); } catch (e: any) { res.status(429).json({ error: e.message }); return; }

  const { data, error } = await supabaseClient.from("replies").insert({ post_id, body: body.trim(), ip_hash }).select("*").single();
  if (error) { res.status(500).json({ error: error.message }); return; }

  res.status(200).json({ reply: data });
}
