import CreateEventCategoryModal from '@/components/modals/create-event-category-modal'
import { Button } from '@/components/ui/button'
import CustomCard from '@/components/ui/custom-card'
import { client } from '@/lib/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'

export default function DashboardEmptyState() {

    const queryClient = useQueryClient()

    const { mutate: insertQuickstartCategories, isPending } = useMutation({
        mutationFn: async () => {
            const response = await client.category.insertQuickstartCategories.$post()
        },
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ['user-event-categories'] })
        },
    })

    return (
        <CustomCard className='flex flex-col items-center justify-center rounded-2xl flex-1 text-center'>
            <div className='flex justify-center w-full'>
                <img src='/brand-asset-wave.png' alt='no categories' className='size-48 -mt-24' />
            </div>

            <h1 className="mt-2 text-xl/8 font-medium tracking-tight text-gray-900">
                No Event Categories Yet
            </h1>

            <p className="text-sm/6 text-gray-600 max-w-prose mt-2 mb-8">
                Start tracking events by creating your first category.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                    variant="outline"
                    className="flex items-center space-x-2 w-full sm:w-auto"
                    onClick={() => insertQuickstartCategories()}
                    disabled={isPending}
                >
                    <span className="size-5">🚀</span>
                    <span>{isPending ? "Creating..." : "Quickstart"}</span>
                </Button>

                <CreateEventCategoryModal containerClassName="w-full sm:w-auto">
                    <Button className="flex items-center space-x-2 w-full sm:w-auto">
                        <span>Add Category</span>
                    </Button>
                </CreateEventCategoryModal>
            </div>

        </CustomCard>
    )

}

