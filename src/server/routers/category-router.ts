import { db } from "@/db";
import { router } from "../__internals/router";
import { privateProcedure } from "../procedures";
import { startOfMonth } from "date-fns"

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
    })
})
