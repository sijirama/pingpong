import { Hono } from "hono"
import { cors } from "hono/cors"
import { handle } from "hono/vercel"
import { postRouter } from "./routers/post-router"
import { auth } from "@/lib/auth"

const app = new Hono().basePath("/api")

app.use(cors())

app.get('/auth/*', (c) => auth.handler(c.req.raw));
app.post('/auth/*', (c) => auth.handler(c.req.raw));



app.route("/post", postRouter)



// The handler Next.js uses to answer API requests
export const httpHandler = handle(app)

export default app

export type AppType = typeof app
