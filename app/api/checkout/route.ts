import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();
    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email required" }, { status: 400 });
    }

    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fontsverse.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "usd",
          recurring: { interval: "year" },
          product_data: {
            name: "FontsVerse Pro",
            description: "Embed all fonts from FontsVerse in any project — unlimited usage",
            images: [`${siteUrl}/logo.svg`],
          },
          unit_amount: 500, // $5.00
        },
        quantity: 1,
      }],
      metadata: { userId },
      success_url: `${siteUrl}/account?upgraded=1`,
      cancel_url:  `${siteUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
