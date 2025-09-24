import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseClient } from "../../utils/supabase";
import { hashIdentity } from "../../utils/hash";
import { enforcePostLimits } from "../../utils/rateLimit";
import { countLinks, isSpammy, similarity } from "../../utils/spam";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") { res.status(405).end(); return; }
  const { body, tag, website_url } = req.body || {};

  if (website_url) { res.status(400).json({ error: "bot" }); return; }
  if (typeof body !== "string" || body.trim().length < 3 || body.length > 500) { res.status(400).json({ error: "length" }); return; }
  if (!["confession", "missed", "meme", "rant"].includes(tag)) { res.status(400).json({ error: "tag" }); return; }
  if (countLinks(body) > 1 || isSpammy(body)) { res.status(400).json({ error: "spam" }); return; }

  const ip_hash = hashIdentity(req);

  try { await enforcePostLimits(ip_hash); } catch (e: any) { res.status(429).json({ error: e.message }); return; }

  const { data: recent } = await supabaseClient.from("posts").select("body").eq("ip_hash", ip_hash).order("created_at", { ascending: false }).limit(5);
  if (recent && recent.some((p) => similarity(p.body, body) >= 0.9)) { res.status(400).json({ error: "duplicate" }); return; }

  const { data, error } = await supabaseClient.from("posts").insert({ body: body.trim(), tag, ip_hash }).select("*").single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(200).json({ post: data });
}
