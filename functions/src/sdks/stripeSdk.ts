import { Stripe } from "stripe";
import z from "zod";
import { fail } from "../../src/utils/devUtils";

export const paymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.literal("usd"),
  status: z.string(),
  client_secret: z.string(),
});
export type TPaymentIntent = z.infer<typeof paymentIntentSchema>;

const retrievePaymentIntent = async (p: { stripe: Stripe; id: string }) => {
  try {
    const paymentIntent = await p.stripe.paymentIntents.retrieve(p.id);

    return paymentIntentSchema.safeParse(paymentIntent);
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};
const createPaymentIntent = async (p: { stripe: Stripe; amount: number }) => {
  try {
    const paymentIntent = await p.stripe.paymentIntents.create({
      amount: p.amount,
      currency: "usd",
    });

    return paymentIntentSchema.safeParse(paymentIntent);
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

export const stripeSdk = {
  retrievePaymentIntent,
  createPaymentIntent,
};
