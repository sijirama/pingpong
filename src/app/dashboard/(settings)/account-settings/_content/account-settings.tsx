"use client"
import { Button } from "@/components/ui/button";
import CustomCard from "@/components/ui/custom-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DISCORD_GUIDE_GUILD_ID, DISCORD_GUILD_INSTALL } from "@/config";
import { client } from "@/lib/client";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export const AccountSettingsContent = ({ user }: { user: User }) => {

    const [discordId, setDiscordId] = useState(user.discordId || "")
    const [slackId, setSlackId] = useState(user.slackId || "")

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const response = await client.project.setBotId.$post({
                discordId,
                slackId
            })
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Success saving changes")
        }
    })

    const onSubmit = () => {
        mutate()
    }

    return (
        <CustomCard className="max-w-xl w-full space-y-4">
            <div className="pt-2">
                <Label>Discord ID</Label>
                <Input
                    className="mt-1"
                    value={discordId}
                    onChange={(e) => setDiscordId(e.target.value)}
                    placeholder="Enter your Discord ID"
                />
            </div>

            <p className="mt-2 text-sm/6 text-gray-600">
                first install the discord bot in your server{" "}
                <Link target="_blank" href={DISCORD_GUILD_INSTALL} className="text-brand-600 hover:text-brand-500">
                    click here to install
                </Link>
                .
            </p>

            <p className="mt-2 text-sm/6 text-gray-600">
                Don't know how to find your Discord ID?{" "}
                <Link target="_blank" href={DISCORD_GUIDE_GUILD_ID} className="text-brand-600 hover:text-brand-500">
                    Learn how to obtain it here
                </Link>
                .
            </p>

            <div className="pt-2">
                <Label>Slack ID</Label>
                <Input
                    className="mt-1"
                    value={slackId}
                    onChange={(e) => setSlackId(e.target.value)}
                    //placeholder="Enter your Slack ID"
                    placeholder="Coming soon"
                    disabled={true} // TODO: Uncomment this when Slack integration is ready
                />
            </div>

            <p className="mt-2 text-sm/6 text-gray-600 hidden">
                Don't know how to find your Slack ID?{" "}
                <Link href="#" className="text-brand-600 hover:text-brand-500">
                    Learn how to obtain it here
                </Link>
                .
            </p>

            <div className="pt-4">
                <Button onClick={() => onSubmit} disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </CustomCard>);
}
