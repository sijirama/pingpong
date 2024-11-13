/**
 * for users to be able to use pingpong
 * in their Discord server, you need to create a Discord bot
 * and add the bot to your Discord server, with the installation link provided
 * add a channel id to your profile, as where the bot should be sending the messages to
 */


import { REST } from "@discordjs/rest"
import {
    RESTPostAPIChannelMessageResult,
    RESTPostAPICurrentUserCreateDMChannelResult,
    Routes,
    APIEmbed
} from "discord-api-types/v10"

export class DiscordClient {
    private rest: REST

    constructor(token: string | undefined) {
        this.rest = new REST({ version: "10" }).setToken(token || "");
    }


    /**
     * Creates a DM channel with a user
     * @param userId The Discord user ID
     */

    async createDM(
        userId: string
    ): Promise<RESTPostAPICurrentUserCreateDMChannelResult> {
        return this.rest.post(Routes.userChannels(), {
            body: { recipient_id: userId },
        }) as Promise<RESTPostAPICurrentUserCreateDMChannelResult>
    }

    /**
     * Sends an embed to any channel (works for both server channels and DMs)
     * @param channelId The channel ID to send the message to
     * @param embed The embed object to send
     */

    async sendEmbed(channelId: string, embed: APIEmbed): Promise<RESTPostAPIChannelMessageResult> {
        return this.rest.post(Routes.channelMessages(channelId), {
            body: { embeds: [embed] }
        }) as Promise<RESTPostAPIChannelMessageResult>
    }

    /**
     * Helper method to send a message to either a server channel or DM
     * @param targetId Either a channel ID or user ID
     * @param embed The embed to send
     * @param isDM Whether the targetId is for a DM (user ID) or channel
     * defaults to a server message   
     */

    async sendMessage(targetId: string, embed: APIEmbed, isDM: boolean = false): Promise<RESTPostAPIChannelMessageResult> {
        try {
            if (isDM) {
                // For DMs, first create the DM channel
                const dmChannel = await this.createDM(targetId);
                return await this.sendEmbed(dmChannel.id, embed);
            } else {
                // For server channels, send directly
                return await this.sendEmbed(targetId, embed);
            }
        } catch (error: any) {
            throw new Error(`Failed to send Discord message: ${error.message}`);
        }
    }
}
