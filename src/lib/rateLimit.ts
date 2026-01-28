
type RateLimitRecord = {
    count: number;
    startTime: number;
};

const rateLimitMap = new Map<string, RateLimitRecord>();

interface RateLimitConfig {
    limit: number; // Max requests
    windowMs: number; // Time window in milliseconds
}

/**
 * Checks if a request limit has been exceeded for a given key.
 * @param key The unique identifier (e.g., IP address)
 * @param config Rate limit configuration (limit, windowMs)
 * @returns { success: boolean } - true if allowed, false if limit exceeded
 */
export function checkRateLimit(key: string, config: RateLimitConfig = { limit: 20, windowMs: 60 * 1000 }): { success: boolean } {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record) {
        rateLimitMap.set(key, { count: 1, startTime: now });
        return { success: true };
    }

    if (now - record.startTime > config.windowMs) {
        // Window expired, reset
        rateLimitMap.set(key, { count: 1, startTime: now });
        return { success: true };
    }

    if (record.count >= config.limit) {
        return { success: false };
    }

    record.count++;
    return { success: true };
}

// Optional: clean up old entries periodically to prevent memory leaks in long-running process
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
        if (now - record.startTime > 60000) { // Clear if older than 1 min (or max window)
            rateLimitMap.delete(key);
        }
    }
}, 60000); // Run every minute
