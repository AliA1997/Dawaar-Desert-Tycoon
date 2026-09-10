import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors, { type CorsOptions } from "cors";
import router from "./routes/index.js";
import { config } from "./config.js";

const app: Express = express();

// Advertising the framework and version only helps someone matching a CVE to it.
app.disable("x-powered-by");

/**
 * CORS.
 *
 * The React Native client sends no `Origin`, so it is unaffected by any of this
 * — but `cors()` with no options answers every browser origin with
 * `Access-Control-Allow-Origin: *`, and this API has no auth, so a web page
 * could otherwise drive live games. When CORS_ALLOWED_ORIGINS is configured we
 * enforce it; when it is not, behaviour is unchanged and `preflight.ts` says so
 * loudly in production rather than leaving `*` to be discovered later.
 */
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // No Origin: a native app, curl, or a same-origin call. Always allowed.
    if (!origin) return callback(null, true);
    if (config.corsAllowedOrigins.length === 0) return callback(null, true);
    if (config.corsAllowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
};
app.use(cors(corsOptions));

// The default 100kb body cap is ~100x the largest legitimate request here (a
// trade carries two short index arrays), and an oversized body is parsed into
// memory before anything rejects it.
app.use(express.json({ limit: config.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));

/**
 * Every API response describes mutable state; none of it may be cached.
 *
 * `GET /games/:id` and `GET /games/:id/poll` are ordinary cacheable GETs. A
 * carrier's transparent proxy or a CDN in front of the deploy may serve one from
 * cache, and a player then sees a board several turns stale while their poll
 * `version` never advances — a game that appears frozen for one player only,
 * which reproduces nowhere and logs nothing. The fix for a cache over live game
 * state is to forbid it, not to tune it.
 */
app.use("/api", (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.use("/api", router);

/**
 * Terminal error handler — mounted last, with nothing after it.
 *
 * Without this an Express 5 handler that throws (a malformed JSON body, say)
 * answers with an HTML error page. The client does `res.json()` on it, the parse
 * throws, and a real error is indistinguishable from a network failure.
 */
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);

  // body-parser marks its own failures; they are the client's fault, not ours.
  const status = (err as { status?: number; statusCode?: number })?.status
    ?? (err as { statusCode?: number })?.statusCode;
  if (status === 400 || status === 413) {
    res.status(status).json({ error: status === 413 ? 'Request body is too large' : 'Malformed request body' });
    return;
  }

  console.error('[error] Unhandled error while serving a request.', err);
  res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
});

export default app;
