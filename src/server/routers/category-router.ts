import { db } from "@/db";
import { router } from "../__internals/router";
import { privateProcedure } from "../procedures";
import { startOfDay, startOfMonth, startOfWeek } from "date-fns"
import { z } from "zod";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validator/category.validator";
import { parseColor } from "@/lib/utils";
import { HTTPException } from "hono/http-exception";

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
    }),

    pollCategory: privateProcedure.input(z.object({ name: CATEGORY_NAME_VALIDATOR }))
        .query(async ({ c, ctx, input }) => {
            const { user } = ctx
            const { name } = input

            const category = await db.eventCategory.findUnique({
                where: {
                    name_userId: {
                        name,
                        userId: user.id,
                    }
                },
                include: {
                    _count: {
                        select: {
                            events: true
                        }
                    }
                }
            })

            if (!category) {
                throw new HTTPException(404, {
                    message: `Category ${name} not found`
                })
            }

            const hasEvents = category._count.events > 0

            return c.json({ hasEvents })
        }),

    getEventsByCategoryName: privateProcedure.input(
        z.object({
            name: CATEGORY_NAME_VALIDATOR,
            page: z.number(),
            limit: z.number().max(50, "Page size must be at most 100"),
            timeRange: z.enum(["today", "week", "month"])
        })
    ).query(async ({ c, input, ctx }) => {

        const {
            name,
            page,
            limit,
            timeRange
        } = input

        const now = new Date()
        let startDate: Date

        switch (timeRange) {
            case "today":
                startDate = startOfDay(now)
                break
            case "week":
                startDate = startOfWeek(now, { weekStartsOn: 0 })
                break
            case "month":
                startDate = startOfMonth(now)
                break
        }

        const [events, eventsCount, uniqueFieldsCount] = await Promise.all([
            db.event.findMany({
                where: {
                    EventCategory: { name, userId: ctx.user.id },
                    createdAt: { gte: startDate },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            db.event.count({
                where: {
                    EventCategory: { name, userId: ctx.user.id },
                    createdAt: { gte: startDate },
                },
            }),
            db.event
                .findMany({
                    where: {
                        EventCategory: { name, userId: ctx.user.id },
                        createdAt: { gte: startDate },
                    },
                    select: {
                        fields: true,
                    },
                    distinct: ["fields"],
                })
                .then((events) => {
                    const fieldNames = new Set<string>()
                    events.forEach((event) => {
                        Object.keys(event.fields as object).forEach((fieldName) => {
                            fieldNames.add(fieldName)
                        })
                    })
                    return fieldNames.size
                }),
        ])

        // console.log({
        //     events,
        //     eventsCount,
        //     uniqueFieldsCount,
        //     totalPages: Math.ceil(eventsCount / limit),
        //     currentPage: page,
        //     timeRange,
        //     name,
        // })

        return c.superjson({
            events,
            eventsCount,
            uniqueFieldsCount,
            totalPages: Math.ceil(eventsCount / limit),
            currentPage: page,
            timeRange,
            name,
        })
    })

})
