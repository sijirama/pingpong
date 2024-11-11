import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/hooks/use-auth-session';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, UserCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Props {
    showName?: boolean;
}

export default function UserButton({ showName = false }: Props) {
    const { user, isLoading } = useAuthSession();
    const router = useRouter();

    const onSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/");
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                {showName && <Skeleton className="h-4 w-24" />}
            </div>
        );
    }

    if (!user) {
        return (
            <Button
                variant="outline"
                onClick={() => router.push("/sign-in")}
                className="gap-2"
            >
                <UserCircle className="h-5 w-5" />
                Sign in
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex cursor-pointer items-center gap-2 rounded-full p-3 px-4 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                    <div className="flex items-center gap-2">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name || 'User'}
                                className="size-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800 transition-all hover:ring-2"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white ring-1 ring-slate-200 dark:ring-slate-800 transition-all hover:ring-2">
                                {user.name ? user.name[0].toUpperCase() : <User className="h-5 w-5" />}
                            </div>
                        )}
                        {showName && (
                            <span className="hidden md:inline-block">
                                {user.name || 'User'}
                            </span>
                        )}
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-8 py-4">
                <DropdownMenuLabel className="font-normal w-full">
                    <div className="flex flex-col space-y-1 w-full">
                        <p className="text-sm font-medium">{user.name || 'User'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => router.push('/settings')}
                    className="cursor-pointer"
                >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
