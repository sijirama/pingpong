import { Hono } from "hono"
import { cors } from "hono/cors"
import { handle } from "hono/vercel"
import { postRouter } from "./routers/post-router"
import { auth, AuthType } from "@/lib/auth"

// Create a new Hono app for the API
const api = new Hono<{
    Variables: {
        user: AuthType["$Infer"]["Session"]["user"] | null;
        session: AuthType["$Infer"]["Session"]["session"] | null;
    }
}>()

// Apply middleware and routes to the api app
api.use(cors())

api.use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        c.set("user", null);
        c.set("session", null);
        return next();
    }
    c.set("user", session.user);
    c.set("session", session.session);
    return next();
});

api.get("/session", async (c) => {
    const session = c.get("session")
    const user = c.get("user")
    if (!user) return c.body(null, 401);
    return c.json({
        session,
        user
    });
});

api.get("/health", async (c) => {
    return c.json({ message: "pong" });
})

api.on(["POST", "GET"], "/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

api.route("/post", postRouter)

// Create the main app and mount the api router with prefix
const app = new Hono()

app.route("/api", api)

export const httpHandler = handle(app)
export default app
export type AppType = typeof app
