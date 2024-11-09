import { createAuthClient } from "better-auth/react"
import { oneTapClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    plugins: [
        oneTapClient({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
        })
    ]
})
