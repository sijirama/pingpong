"use client"

import { Button } from "@/components/ui/button";
import CustomCard from "@/components/ui/custom-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/lib/client";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ApiKeyPageContent = ({ user }: { user: User }) => {

    const [copySuccess, setCopySuccess] = useState(false)
    const [apiKey, setApiKey] = useState(user.apiKey)

    const copyApiKey = () => {
        navigator.clipboard.writeText(apiKey)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
    }

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const response = await client.project.refreshApiKey.$post()
            return await response.json()
        },
        onSuccess: (response) => {
            setApiKey(response.apiKey)
            toast.success("success refreshing api key")
        },
        onError: (err) => {
            toast.error("Error refreshing api key")
            console.error(err)
        }
    })

    return (
        <CustomCard className="max-w-xl w-full">
            <div>
                <Label>Your API Key</Label>
                <div className="mt-1 relative">
                    <Input type="" value={apiKey} readOnly />
                    <div className="absolute space-x-0.5 inset-y-0 right-0 flex items-center">
                        <Button
                            variant="ghost"
                            onClick={copyApiKey}
                            disabled={isPending}
                            className="p-1 w-10 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            {copySuccess ? (
                                <CheckIcon className="size-4 text-brand-900" />
                            ) : (
                                <ClipboardIcon className="size-4 text-brand-900" />
                            )}
                        </Button>
                    </div>
                </div>

                <p className="mt-2 text-sm/6 text-gray-600">
                    Keep your key secret and do not share it with others.
                </p>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mt-2">
                    <Button className="" onClick={() => mutate()}>
                        Generate New API Key
                    </Button>
                    <span className="ml-2 text-sm/6 text-gray-600">
                        (Make sure to update this accross your devices)
                    </span>
                </div>
            </div>
        </CustomCard>)
}
