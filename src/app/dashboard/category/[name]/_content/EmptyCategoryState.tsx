
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function EmptyCategoryState({ categoryName }: { categoryName: string }) {

    const router = useRouter()

    const { data } = useQuery({
        queryKey: ["category", categoryName, "hasEvents"],
        queryFn: async () => {
        },
    })

    return (
        <div>EmptyCategoryState</div>
    )
}

