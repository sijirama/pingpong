import { addMonths, startOfMonth } from "date-fns";
import { router } from "../__internals/router";
import { privateProcedure } from "../procedures";
import { db } from "@/db";
import { FREE_QUOTA, PREMIUM_QUOTA } from "@/config";
import { z } from "zod";
import { createId } from '@paralleldrive/cuid2';

export const projectRouter = router({

    getUsage: privateProcedure.query(async ({ c, ctx }) => {

        const { user } = ctx
        const currentDate = startOfMonth(new Date())

        const quota = await db.quota.findFirst({
            where: {
                userId: user.id,
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1
            }
        })

        const eventCount = quota?.count ?? 0

        const categoryCount = await db.eventCategory.count({
            where: {
                userId: user.id
            }
        })

        const limit = user.plan === "PRO" ? PREMIUM_QUOTA : FREE_QUOTA

        const resetDate = addMonths(currentDate, 1)
        return c.json({
            categoriesUsed: categoryCount,
            categoriesLimit: limit.maxEventsCategories,
            eventsUsed: eventCount,
            eventsLimit: limit.maxEventsPerMonth,
            resetDate
        })
    }),

    setBotId: privateProcedure.input(z.object({
        discordId: z.string().optional(),
        slackId: z.string().optional()
    })).mutation(async ({ input, c, ctx }) => {
        const { user } = ctx
        const { discordId, slackId } = input

        await db.user.update({
            where: { id: user.id },
            data: {
                discordId,
                slackId
            }
        })

        return c.json({ success: true })
    }),

    refreshApiKey: privateProcedure.mutation(async ({ c, ctx }) => {
        const uniqueId = (createId());

        const updatedUser = await db.user.update({
            where: { id: ctx.user.id },
            data: {
                apiKey: uniqueId
            },
            select: {
                apiKey: true,
            }
        })

        return c.json({ apiKey: updatedUser.apiKey })
    })
})
