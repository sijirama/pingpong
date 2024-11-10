import { Hono } from "hono"
import { handle } from "hono/vercel"
import { auth, AuthType } from "@/lib/auth"
import { cors } from "hono/cors"
import { sessionMiddleware } from "./middleware/auth"

// Create a new Hono app for the API
const api = new Hono<{
    Variables: {
        user: AuthType["$Infer"]["Session"]["user"] | null;
        session: AuthType["$Infer"]["Session"]["session"] | null;
    }
}>().basePath('/api').use(cors()).use(sessionMiddleware())

api.use(async (c, next) => {
    console.log(`username is ${c.get("user")?.name}`)
    await next()
})

api.on(["POST", "GET"], "/auth/**", (c) => {
    return auth.handler(c.req.raw);
});

api.get("/health", async (c) => {
    if (c.get("user")) {
        return c.json({ message: `pong ${c.get("user")?.name}` })
    }
    return c.json({ message: "pong" });
})

api.all("*", (c) => {
    console.log(`[404] Request raw: ${JSON.stringify(c.req.raw)}`);
    return c.json({
        error: "Route not found",
        path: c.req.path,
        method: c.req.method
    }, 404);
});

export const httpHandler = handle(api)
export default api
export type AppType = typeof api
