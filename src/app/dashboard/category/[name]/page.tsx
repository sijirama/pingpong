import DashboardPage from '@/components/blocks/dashboard/DashboardPage'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import React from 'react'
import CategoryPageContent from './_content/CategoryPageContent'

interface Props {
    params: {
        name: string | string[] | undefined
    }
}

export default async function Page({ params }: Props) {
    console.log(typeof params.name)
    if (typeof params.name !== 'string') notFound()

    const session = await auth.api.getSession({
        headers: headers()
    })
    if (!session) {
        redirect("/sign-in")
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
    })

    if (!user) {
        redirect("/sign-in")
    }

    const category = await db.eventCategory.findUnique({
        where: {
            name_userId: {
                name: params.name,
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

    if (!category) notFound()

    const hasEvents = category._count.events > 0

    return (
        <DashboardPage title={`${category.emoji} ${category.name} category`}>
            <CategoryPageContent hasEvents={hasEvents} category={category} />
        </DashboardPage>
    )
}

