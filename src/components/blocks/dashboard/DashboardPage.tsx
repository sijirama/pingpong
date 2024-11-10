import { Heading } from '@/components/custom/Heading'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import React, { ReactNode } from 'react'

interface Props {
    title: string
    children?: ReactNode
    hideBackButton?: boolean
    cta?: ReactNode
}

export default function DashboardPage({
    title,
    children,
    hideBackButton = true,
    cta,
}: Props) {
    return (
        <section className='flex-1 h-full w-full flex flex-col'>
            <div className='p-6 sm:p-8 flex justify-between border-b border-gray-200'>
                <div className='flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-8'>
                    {hideBackButton && (
                        <Button className='w-fit bg-white ' variant={"outline"} >
                            <ArrowLeft className='size-4' />
                        </Button>
                    )}
                    <Heading>{title}</Heading>
                    {cta ? (
                        <div>{cta}</div>
                    ) : null}
                </div>
            </div>
            <div className='flex-1 p-6 sm:p-8 flex flex-col overflow-y-auto '>{children}</div>
        </section>
    )
}

