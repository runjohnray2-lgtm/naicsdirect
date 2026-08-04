import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn =
    "https://402c5c267f3981ffa98fe29b5e89f1ba@o4511849854730240.ingest.us.sentry.io/4511849876750336";

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.2,
      debug: false,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.2,
      debug: false,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
