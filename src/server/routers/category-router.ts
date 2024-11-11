import { db } from "@/db";
import { router } from "../__internals/router";
import { privateProcedure } from "../procedures";
import { startOfMonth } from "date-fns"
import { z } from "zod";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validator/category.validator";
import { parseColor } from "@/lib/utils";

export const categoryRouter = router({
    getEventCategories: privateProcedure.query(async ({ c, ctx }) => {
        const { user } = ctx

        const categories = await db.eventCategory.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true,
                name: true,
                emoji: true,
                color: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        })

        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const now = Date.now();
                const firstDayOfMonth = startOfMonth(now)

                const [uniqueFieldsCount, eventsCountForMonth, lastPing] = await Promise.all([

                    db.event.findMany({
                        where: {
                            EventCategory: { id: category.id },
                            createdAt: { gte: firstDayOfMonth }
                        },
                        select: { fields: true },
                        distinct: ["fields"]
                    }).then((events) => {
                        const fieldnames = new Set<string>()
                        events.forEach((event) => {
                            Object.keys(event.fields as Object).forEach((fieldName) => {
                                fieldnames.add(fieldName)
                            })
                        })
                        return fieldnames.size
                    }),

                    db.event.count({
                        where: {
                            EventCategory: { id: category.id },
                            createdAt: { gte: firstDayOfMonth }
                        },
                    }),

                    db.event.findFirst({
                        where: {
                            EventCategory: { id: category.id },
                        },
                        orderBy: { createdAt: "desc" },
                        select: { createdAt: true },
                    })

                ])

                return {
                    ...category,
                    uniqueFieldsCount,
                    eventsCountForMonth,
                    lastPing: lastPing?.createdAt || null,
                }
            })
        )

        return c.superjson({ categories: categoriesWithCounts })
    }),

    deleteCategory: privateProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input, ctx, c }) => {
            const { user } = ctx
            const category = await db.eventCategory.findFirst({
                where: {
                    name: input.name,
                    userId: user.id,
                },
            })
            if (!category) {
                throw new Error("Category not found")
            }

            await db.eventCategory.delete({ where: { id: category.id } })

            return c.json({ success: true })
        }),

    createEventCategory: privateProcedure.input(z.object({
        name: CATEGORY_NAME_VALIDATOR,
        color: z.string().min(1, "Color is required.").regex(/^#[0-9A-F]{6}$/i, "Invalid color format."),
        emoji: z.string().emoji("Invalid emoji.").optional()
    })).mutation(async ({ input, c, ctx }) => {
        //TODO: ADD PAID PLAN LOGIC
        const eventCategory = await db.eventCategory.create({
            data: {
                name: input.name.toLowerCase(),
                color: parseColor(input.color),
                emoji: input.emoji,
                userId: ctx.user.id,
            }
        })

        return c.json({ success: true, eventCategory })
    }),

    insertQuickstartCategories: privateProcedure.mutation(async ({ c, ctx }) => {
        const categories = await db.eventCategory.createMany({
            data: [
                { name: "bug", emoji: "🐛", color: 0xff6b6b },
                { name: "sale", emoji: "💰", color: 0xffeb3b },
                { name: "question", emoji: "🤔", color: 0x6c5ce7 },
            ].map((category) => ({
                ...category,
                userId: ctx.user.id,
            })),
        })
        return c.json({ success: true, count: categories.count })
    })

})
