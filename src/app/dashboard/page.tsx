import { db } from '@/db'
import { auth } from "@/lib/auth"
import { redirect } from 'next/navigation'
import React from 'react'
import { headers } from "next/headers"
import DashboardPage from '@/components/blocks/dashboard/DashboardPage'
import { DashboardPageContent } from './_content/page-content'

export default async function Page() {

    const session = await auth.api.getSession({
        headers: headers()
    })


    if (!session) {
        redirect("/sign-in")
    }

    const user = db.user.findUnique({
        where: { id: session.user.id },
    })

    if (!user) {
        redirect("/sign-in")
    }

    return (
        <DashboardPage title='Dashboard'>
            <DashboardPageContent />
        </DashboardPage>
    )
}

