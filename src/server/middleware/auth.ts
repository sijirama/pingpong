import { auth } from "@/lib/auth";
import { Context } from "hono";
import { createMiddleware } from 'hono/factory'

export const sessionMiddleware = () => {
    return createMiddleware(async (c, next) => {
        const session = await auth.api.getSession({ headers: c.req.raw.headers });

        if (!session) {
            c.set("user", null);
            c.set("session", null);
            return next();
        }

        c.set("user", session.user);
        c.set("session", session.session);
        return next();
    })
};


export const ValidateSessionManually = async (c: Context): Promise<Context> => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        c.set("user", null);
        c.set("session", null);
        return c;
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return c;
}
