export const FREE_QUOTA = {
    maxEventsPerMonth: 150,
    maxEventsCategories: 3
} as const

export const PREMIUM_QUOTA = {
    maxEventsPerMonth: 1000,
    maxEventsCategories: 10
} as const

export const CONFIG = {
    URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    DISCORD_TOKEN: process.env.DISCORD_BOT_TOKEN,
    SLACK_TOKEN: process.env.SLACK_BOT_TOKEN
}

export const DISCORD_INVITE_LINK = "https://discord.com/oauth2/authorize?client_id=1306045899587321856"
export const DISCORD_GUILD_INSTALL = "https://discord.com/oauth2/authorize?client_id=1306045899587321856&permissions=2048&integration_type=0&scope=bot"
