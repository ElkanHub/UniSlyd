"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/dashboard/sidebar"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <VisuallyHidden.Root>
                    <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden.Root>
                <SidebarContent />
            </SheetContent>
        </Sheet>
    )
}
