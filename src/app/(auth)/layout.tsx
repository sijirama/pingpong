import { ReactNode } from "react"
import Navbar from "@/components/custom/Navbar"

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}

export default Layout
