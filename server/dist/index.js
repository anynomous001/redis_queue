"use strict";
import express from "express";
import { createClient } from "redis";
const app = express();
const redis = createClient();
// Redis event handlers
redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));
app.use(express.json());
// Rate limiter configuration
const RATE_LIMIT = 5;
const WINDOW_SECONDS = 60;
// Check rate limit for an IP
async function checkRateLimit(ip) {
    const key = `ratelimit:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
        await redis.expire(key, WINDOW_SECONDS);
    }
    const ttl = await redis.ttl(key);
    return {
        allowed: count <= RATE_LIMIT,
        remaining: Math.max(0, RATE_LIMIT - count),
        resetIn: ttl
    };
}
// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
    const ip = req.ip;
    console.log(ip)
    try {
        const result = await checkRateLimit(ip);
        if (!result.allowed) {
            return res.status(429).json({
                message: 'Too many requests. Please wait.',
                resetAfterSeconds: result.resetIn
            });
        }
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', result.resetIn);
        next();
    } catch (err) {
        console.error('Rate limiter error:', err);
        next();
    }
};
app.get("/", rateLimitMiddleware, (req, res) => {
    res.send("Hello World!");
});
app.post("/", rateLimitMiddleware, async (req, res) => {
    const { problemId, language, code } = req.body;
    try {
        const submission = await redis.lPush("submissions", JSON.stringify({ language, problemId, code }));
        res.status(200).json({ submission });
        console.log("Submission added to Redis");
    } catch (error) {
        res.status(500).json({ error: "Failed to submit code" });
        console.error(error);
    }
});
// Protected route with rate limit
app.get('/api/protected', rateLimitMiddleware, (req, res) => {
    const user = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        otp: '123456'
    }
    res.json({ user, message: 'Success ✅ - You are within the rate limit!' });
});
async function startServer() {
    try {
        await redis.connect();
        app.listen(3000, () => {
            console.log("Server running on port 3000");
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
startServer();
// function otp() {
//     const pin = 3532;
//     for (let i = 1000; i < 9999; i++) {
//         console.log(i);
//         if (i == pin) {
//             console.log("OTP is: ", i);
//             break;
//         }
//     }
// }
// while (true) {
//     otp();
//     console.log("Waiting for 5 seconds...");
//     setTimeout(() => {
//         console.log("5 seconds passed");
//     }, 450000000);
// }
