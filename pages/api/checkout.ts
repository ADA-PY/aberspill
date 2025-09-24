import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") { res.status(405).end(); return; }
  const { post_id } = req.body || {};
  if (!post_id) { res.status(400).json({ error: "post_id" }); return; }

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price_data: { currency: "gbp", unit_amount: 99, product_data: { name: "AberSpill Boost (24h)" } }, quantity: 1 }],
      metadata: { postId: post_id },
      success_url: `${site}/p/${post_id}?boost=success`,
      cancel_url: `${site}/boost/${post_id}`,
      payment_intent_data: { description: "AberSpill" }
    });
    res.status(200).json({ url: session.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
