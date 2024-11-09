import { Hono } from "hono"
import { handle } from "hono/vercel"
import { auth, AuthType } from "@/lib/auth"
import { cors } from "hono/cors"

// Create a new Hono app for the API
const api = new Hono<{
    Variables: {
        user: AuthType["$Infer"]["Session"]["user"] | null;
        session: AuthType["$Infer"]["Session"]["session"] | null;
    }
}>().basePath('/api').use(cors())

api.on(["POST", "GET"], "/auth/**", (c) => {
    //console.log("THE FREAKING REQUEST AFTER IVE SWITCHED ON CORS: ", c.req.raw)
    return auth.handler(c.req.raw);
});

api.get("/health", async (c) => {
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
