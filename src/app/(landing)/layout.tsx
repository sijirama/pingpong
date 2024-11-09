
import React from 'react'
import Navbar from '../components/custom/Navbar'
import { ReactNode } from 'hono/jsx'

export default function Layout({ children }: { children: ReactNode }) {
    return (<>
        <Navbar />
        {children}
    </>)
}

