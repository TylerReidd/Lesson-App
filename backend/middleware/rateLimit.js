const WINDOW_MS = 15 * 60 * 1000;

export function createRateLimiter({
  windowMs = WINDOW_MS,
  max = 60,
  message = "Too many requests. Please try again later.",
} = {}) {
  const hits = new Map();

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const key = `${req.ip}:${req.baseUrl || ""}:${req.path || ""}`;
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((entry.resetAt - now) / 1000)
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({ message });
    }

    return next();
  };
}
