'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UsageBanner } from '@/components/dashboard/usage-banner'
import { signOut } from '@/app/(auth)/actions'
import { LayoutDashboard, MessageSquarePlus, Settings, LogOut, FileText, MessageSquare } from 'lucide-react'
import { ModeToggle } from '@/components/ui/mode-toggle'

export function Sidebar() {
    const pathname = usePathname()

    const links = [
        { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
        { href: '/dashboard/chat/new', label: 'New Study Session', icon: MessageSquarePlus },
        { href: '/dashboard/chats', label: 'My Chats', icon: MessageSquare },
        { href: '/dashboard/decks', label: 'My Decks', icon: FileText },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]

    return (
        <div className="flex bg-muted/20 border-r w-64 h-screen flex-col flex-shrink-0">
            <div className="p-6">
                <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                    <Link href="/">Unislyd</Link>
                </h2>
            </div>

            <div className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href
                    return (
                        <Link key={link.href} href={link.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-2", isActive && "bg-muted font-semibold")}
                            >
                                <Icon className="w-4 h-4" />
                                {link.label}
                            </Button>
                        </Link>
                    )
                })}
            </div>

            <div className="mt-auto">
                <UsageBanner />
                <div className="p-4 border-t space-y-2">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-medium text-muted-foreground">Theme</span>
                        <ModeToggle />
                    </div>
                    <form action={signOut}>
                        <Button variant="outline" className="w-full gap-2 text-muted-foreground" size="sm">
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
