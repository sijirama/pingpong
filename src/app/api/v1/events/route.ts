import { CONFIG, FREE_QUOTA, PREMIUM_QUOTA } from "@/config";
import { db } from "@/db";
import { DiscordClient } from "@/lib/platforms/discord";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validator/category.validator";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const REQUEST_VALIDATOR = z.object({
    category: CATEGORY_NAME_VALIDATOR,
    fields: z.record(z.string().or(z.number()).or(z.boolean())).optional(),
    description: z.string().optional()
}).strict()

export const POST = async (req: NextRequest) => {
    try {
        const authHeader = req.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Invalid Authorization header format. Expected "Bearer <API_KEY>" ' }, { status: 401 });
        }

        const apiKey = authHeader.split(" ")[1]

        if (!apiKey || apiKey.trim() == '') {
            return NextResponse.json({ message: 'Invalid API Key' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: {
                apiKey: apiKey
            },
            include: {
                EventCategories: true
            }
        })

        if (!user) {
            return NextResponse.json({ message: 'Invalid API Key' }, { status: 401 });
        }

        if (!user.discordId) {
            return NextResponse.json({ message: 'User is not connected to Discord' }, { status: 403 });
        }

        //Actual Logic
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()

        const quota = await db.quota.findUnique({
            where: {
                userId: user.id,
                year: currentYear,
                month: currentMonth
            }
        })

        const quotaLimit = user.plan === "FREE" ? FREE_QUOTA.maxEventsPerMonth : PREMIUM_QUOTA.maxEventsPerMonth

        if (quota && quota.count >= quotaLimit) {
            return NextResponse.json({ message: 'Monthly Quota exceeded, Please upgrade your account for more events' }, { status: 429 });
        }

        let requestData: unknown

        try {
            requestData = await req.json()
        } catch (error) {
            return NextResponse.json({ message: 'Invalid JSON request body' }, { status: 400 });
        }

        const validatedRequest = REQUEST_VALIDATOR.parse(requestData)

        const category = user.EventCategories.find(cat => {
            return cat.name === validatedRequest.category
        })

        if (!category) {
            return NextResponse.json({ message: `You don't have a category names ${validatedRequest.category}` }, { status: 404 });
        }

        const eventData = {
            title: `${category.emoji || "🔔"} ${category.name.charAt(0).toUpperCase() + category.name.slice(1)}`,
            description: validatedRequest.description || `A new ${category.name} event has occured!`,
            color: category.color,
            timeStamp: new Date().toISOString(),
            fields: Object.entries(validatedRequest.fields || {}).map(([key, value]) => {
                return {
                    name: key,
                    value: String(value),
                    inline: false
                }
            })
        }

        const event = await db.event.create({
            data: {
                name: category.name,
                formattedMessage: `${eventData.title}\n\n${eventData.description}`,
                userId: user.id,
                fields: validatedRequest.fields || {},
                eventCategoryId: category.id
            }
        })

        try {

            const discord = new DiscordClient(CONFIG.DISCORD_TOKEN);
            await discord.sendMessage(user.discordId, eventData);

            await db.event.update({
                where: {
                    id: event.id
                },
                data: {
                    deliveryStatus: "DELIVERED"
                }
            })

            await db.quota.upsert({
                where: { userId: user.id, month: currentMonth, year: currentYear },
                update: { count: { increment: 1 } },
                create: { userId: user.id, month: currentMonth, year: currentYear, count: 1 }
            })

        } catch (error: any) {
            await db.event.update({
                where: {
                    id: event.id
                },
                data: {
                    deliveryStatus: "FAILED"
                }
            })
            console.log(error.message);
            return NextResponse.json({ message: 'Error Processing event', error: error, eventId: event.id }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Event Processed successfully',
            eventId: event.id
        })

    } catch (error) {
        console.log(error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.message }, { status: 422 });
        }

        return NextResponse.json({ message: 'An error occurred', error: error }, { status: 500 });
    }
}
