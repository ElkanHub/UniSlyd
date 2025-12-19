'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const pathname = usePathname()

    const toggleMenu = () => setIsOpen(!isOpen)

    // Close menu when route changes
    React.useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Unislyd</span>
                    </Link>
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <Link href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</Link>
                        <Link href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex gap-4">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Log in</Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">Sign up</Button>
                        </Link>
                    </div>

                    <button className="flex items-center p-2 md:hidden" onClick={toggleMenu}>
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t p-4 bg-background">
                    <nav className="flex flex-col gap-4 text-sm">
                        <Link href="#features" className="text-foreground/60 hover:text-foreground">Features</Link>
                        <Link href="#pricing" className="text-foreground/60 hover:text-foreground">Pricing</Link>
                        <div className="border-t my-2" />
                        <Link href="/login" className="font-medium">Log in</Link>
                        <Link href="/signup" className="font-medium text-primary">Sign up</Link>
                    </nav>
                </div>
            )}
        </header>
    )
}
