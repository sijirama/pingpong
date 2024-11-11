"use client"
import DashboardEmptyState from "@/components/blocks/dashboard/DashboardEmptyState";
import { LoadingSpinner } from "@/components/custom/LoadingSpinner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { client } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowRight, BarChart, Clock, Database, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props { }
export function DashboardPageContent({ }: Props) {
    const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const { data: categories, isPending: isEventCategoriesLoading } = useQuery({
        queryKey: ["user-event-categories"],
        queryFn: async () => {
            const response = await client.category.getEventCategories.$get()
            const { categories } = await response.json()
            return categories
        },
    })

    const { mutate: deleteCategory, isPending: isDeletingCategory } = useMutation({
        mutationFn: async (name: string) => {
            await client.category.deleteCategory.$post({ name })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user-event-categories"] })
            setDeletingCategory(null)
        },
    })

    if (isEventCategoriesLoading) {
        return <div className="flex items-center justify-center flex-1 h-full w-full">
            <LoadingSpinner />
        </div>
    }

    if (!categories || categories.length === 0) {
        return <DashboardEmptyState />
    }

    return (
        <>
            <ul className="grid max-w-6xl grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {categories?.map((category) => (
                    <li key={category.id} className="relative group z-10 transition-all duration-200 hover:-translate-y-0.5">
                        <div className="absolute z-0 inset-px rouned-lg bg-white" />
                        <div className=" pointer-events-none z-0 inset-px rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md ring-1 ring-black/5" />
                        <div className="relative p-6 z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-12 rounded-full" style={{
                                    backgroundColor: category.color ? `#${category.color.toString(16).padStart(6, "0")}` : "#f3f4f6"
                                }} />
                                <div>
                                    <h3 className="text-lg/7 font-medium tracking light text-gray-950">
                                        {category.emoji || "📂"} {category.name}
                                    </h3>
                                    <p className="text-sm/6 text-gray-600">
                                        {format(category.createdAt, "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm/5 text-gray-600">
                                    <Clock className="size-4 mr-2 text-brand-500" />
                                    <span className="font-medium">Last ping:</span>
                                    <span className="ml-1">
                                        {category.lastPing ? formatDistanceToNow(category.lastPing) + " ago" : " Never"}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm/5 text-gray-600">
                                    <Database className="size-4 mr-2 text-brand-500" />
                                    <span className="font-medium">Unique fields:</span>
                                    <span className="ml-1">
                                        {category.uniqueFieldsCount || 0}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm/5 text-gray-600">
                                    <BarChart className="size-4 mr-2 text-brand-500" />
                                    <span className="font-medium">Events this month:</span>
                                    <span className="ml-1">
                                        {category.eventsCountForMonth || 0}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 ">
                                <Link href={`/dashboard/category/${category.name}`}
                                    className={buttonVariants({
                                        variant: "outline",
                                        size: "sm",
                                        className: "flex items-center gap-2 text-sm"
                                    })}
                                >View all <ArrowRight className="size-4" /></Link>
                                <Button variant={"ghost"}
                                    onClick={() => setDeletingCategory(category.name)}
                                    size={"sm"} className="text-gray-600 hover:text-red-600 transition-colors " aria-label={`Delete ${category.name} category`}>
                                    <Trash2 className="size-5" />
                                </Button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <Modal showModal={!!deletingCategory} setShowModal={() => setDeletingCategory(null)} className="max-w-md p-8">
                <div className="space-y-6" >
                    <div>
                        <h2 className="text-lg/7 font-medium tracking-tight text-gray-950">Delete Category</h2>
                        <p className="text-sm/6 text-gray-600">
                            Are you sure you want to delete the category "{deletingCategory}"? This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button variant={"ghost"} onClick={() => setDeletingCategory(null)} size={"sm"} className="text-gray-600 hover:text-red-600 transition-colors ">
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            deleteCategory && deleteCategory(deletingCategory!)
                        }}
                            disabled={isDeletingCategory}
                            variant={"destructive"}
                        >
                            {isDeletingCategory ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
