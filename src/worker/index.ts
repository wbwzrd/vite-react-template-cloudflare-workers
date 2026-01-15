import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();



console.log("Worker is starting up...");

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.get("/api/hello", async (c) => {
    const cache = caches.default;

    // Use the incoming request as the key
    const cacheKey = new Request(c.req.url, c.req);

    console.log(cacheKey);

    // check cache first
    const cached = await cache.match(cacheKey);
    if (cached) {
        return cached;
    }

    const data = { message: 'Hello from Worker API', time: new Date().toISOString() };

    // store in cache
    const res = new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });

    // Store in cache asynchronously
    c.executionCtx.waitUntil(cache.put(cacheKey, res.clone()));

    return res
}
);

export default app;
