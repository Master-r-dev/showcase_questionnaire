import { RateLimiter, Unit } from "redis-sliding-rate-limiter";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/config/config.env" });

import client from "./redisClient.js";
// Updated URL mappings according to routes.js
/* const urlMappings = [
  {
    regex: /^\/api\/users\/(\?.*)?$/,
    newPath: "/api/user",
  },
]; */

function pickRateForUrl(url, method) {
  if (process.env.NODE_ENV === "production") {
    switch (method) {
      case "GET":
        return 20; // Rate limit for authentication
      case "POST":
        return 15; // Rate limit for refresh token
      case "PATCH":
        return 15; // Rate limit for get user
      case "DELETE":
        return 5;
      default:
        return 20; // Default rate limit for unspecified routes
    }
    //switch (url) // - for more precise rate limiting
  } else {
    return 50; // Higher limit for non-production environments
  }
}

const rL = {
  // Define limiters that will be evaluated from this middleware for each request
  limiters: [
    {
      limiter: new RateLimiter({
        client: client,
        window: {
          unit: Unit.MINUTE, //Unit.DAY
          size: 2, //1
          subdivisionUnit: Unit.SECOND, // Defines with which precision elements would expire in the current window
        },
        limit: 80, // 500 req per day
      }),
      overrideKey: true,
      overrideLimit: true,
      errorMessage: "[Please, stop] Too many requests",
    },
  ],

  // Error status code
  errorStatusCode: 429,

  // Compute Redis key from request and limiter objects.
  overrideKeyFn: (req) => {
    let url = req.originalUrl;
    // make one key for urls with multiple versions of url
    /* for (const mapping of urlMappings) {
      if (url.match(mapping.regex)?.input) {
        url = mapping.newPath;
        break;
      }
    } */
    return `${req.ip}__${url}`;
  },

  // Enable/disable setting headers on response
  setHeaders: true,

  // Custom function to set headers on response object (otherwise default headers will be used)
  setHeadersFn: (req, res, limiter, limiterResponse) => {
    const { remaining, firstExpireAtMs, windowExpireAtMs } = limiterResponse;
    res.set("remainingR", "" + remaining);
    res.set("firstExpireR", "" + firstExpireAtMs);
    res.set("resetL", "" + windowExpireAtMs);
  },

  // Override limit if enabled.
  overrideLimitFn: (req, limiter) => {
    // Must return a positive integer!  Calmly, AL_S
    let url = req.originalUrl;
    // make one key for urls with multiple versions of url
    /* for (const mapping of urlMappings) {
      if (url.match(mapping.regex)?.input) {
        url = mapping.newPath;
        break;
      }
    } */
    return parseInt(pickRateForUrl(url, req.method));
  },

  // Skip (whitelist) requests. Should return true if the request must be skipped, false otherwise
  skip: (req) => {
    /* const adminPassword = req.headers["x-admin-password"];
    if (adminPassword === process.env.RATE_LIMIT_PASSWORD) {
      // Skip rate limiting
      return true;
    } */
    return false;
  },

  // Function called when a request is throttled (not allowed)
  onThrottleRequest: (req, res, key) => {
    return res.status(429).send(`Too many requests`);
  },
};

export default rL;
