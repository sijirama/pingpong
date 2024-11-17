import DashboardPage from '@/components/blocks/dashboard/DashboardPage'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import { ApiKeyPageContent } from './_content/api-key-page-content'

async function page() {

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

    return (
        <DashboardPage title='Api Key'>
            <ApiKeyPageContent user={user} />
        </DashboardPage>
    )
}

export default page
