import { Stripe } from "stripe";
import z from "zod";
import { fail, TSuccessOrFail } from "../../utils/devUtils";

export const paymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.literal("gbp"),
  status: z.string(),
  client_secret: z.string(),
});

const retrievePaymentIntent = async (p: {
  stripe: Stripe;
  id: string;
}): Promise<TSuccessOrFail<z.infer<typeof paymentIntentSchema>>> => {
  try {
    const paymentIntent = await p.stripe.paymentIntents.retrieve(p.id);

    return paymentIntentSchema.safeParse(paymentIntent);
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};
const createPaymentIntent = async (p: {
  stripe: Stripe;
  amount: number;
}): Promise<TSuccessOrFail<z.infer<typeof paymentIntentSchema>>> => {
  try {
    const paymentIntent = await p.stripe.paymentIntents.create({
      amount: p.amount,
      currency: "gbp",
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
