import { createAuthClient } from "better-auth/client"
const client = createAuthClient()

const signInWithGoogle = async () => {
    const data = await client.signIn.social({
        provider: "google"
    })
}
