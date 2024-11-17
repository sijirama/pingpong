import DashboardPage from '@/components/blocks/dashboard/DashboardPage'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import { AccountSettingsContent } from './_content/account-settings'

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
        <DashboardPage title='Account Settings'>
            <AccountSettingsContent user={user} />
        </DashboardPage>
    )
}

export default page
