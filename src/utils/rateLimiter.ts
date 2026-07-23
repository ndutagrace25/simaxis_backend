import rateLimit from "express-rate-limit";

// Guards public, unauthenticated endpoints (e.g. meter/payment lookups) from
// being scraped or brute-forced. Keyed by IP by default.
const publicTokenLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many requests. Please try again later.",
  },
});

export { publicTokenLookupLimiter };
