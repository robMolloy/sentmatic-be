import Test from "firebase-functions-test";
import * as routes from "../../routes";

const test = Test();

const initWrappedCreateStripePaymentIntentRoute = test.wrap(routes.createStripePaymentIntentRoute);
export const wrappedCreateStripePaymentIntentRoute = (p: {
  data: Record<string, any>;
  auth: Record<string, any>;
}) => {
  // @ts-ignore
  return initWrappedCreateStripePaymentIntentRoute(p);
};

const initWrappedConfirmSuccessfulStripePaymentAndUpdateBalanceDocRoute = test.wrap(
  routes.confirmSuccessfulStripePaymentAndUpdateBalanceDocRoute
);
export const wrappedConfirmSuccessfulStripePaymentAndUpdateBalanceDocRoute = (p: {
  data: Record<string, any>;
  auth: Record<string, any>;
}) => {
  // @ts-ignore
  return initWrappedConfirmSuccessfulStripePaymentAndUpdateBalanceDocRoute(p);
};
