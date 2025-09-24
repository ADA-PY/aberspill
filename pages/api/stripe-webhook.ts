import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { supabaseService } from "../../utils/supabase";
export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") { res.status(405).end(); return; }
  const sig = req.headers["stripe-signature"] as string;
  const buf = await buffer(req);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const postId = (session.metadata as any)?.postId as string | undefined;
    if (postId && supabaseService) {
      const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabaseService.from("posts").update({ boosted_until: until }).eq("id", postId);
    }
  }
  res.json({ received: true });
}
