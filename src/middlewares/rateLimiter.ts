/* eslint-disable @typescript-eslint/no-explicit-any */
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "../utils/redisClient";

export const limiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args: any[]): Promise<any> => {
            return redis.call(args[0], ...args.slice(1));
        },
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
});

export const likeLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args: any[]): Promise<any> => {
            return redis.call(args[0], ...args.slice(1));
        },
    }),
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Too many requests. Please slow down!" },
    keyGenerator: (req) => req.user?.id || "anonymous",
});
