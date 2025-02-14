import { Stripe } from "stripe";

const stripeSecretKey =
  "sk_test_51QhH4nIGFJRyk0RhUnRTVsXZICgwBLG5C6tiDecTJNR5MC40Skm1y3HMQt0HQA0dEdReAcEH3v2TozuJ9mlLHBQM00d3N3noeZ";
export const stripe = new Stripe(stripeSecretKey);
