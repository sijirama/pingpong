import { db } from "@/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { oneTap } from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    advanced: {
        crossSubDomainCookies: {
            enabled: true
        }
    },
    plugins: [
        oneTap(),
    ],
})

export type AuthType = typeof auth
