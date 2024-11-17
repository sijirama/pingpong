import { createAuthClient } from "better-auth/react"
import { oneTapClient } from "better-auth/client/plugins"
import { CONFIG } from "@/config"

export const authClient = createAuthClient({
    baseURL: CONFIG.URL,
    plugins: [
        oneTapClient({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
        })
    ]
})
