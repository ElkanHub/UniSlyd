import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="md:hidden p-4 border-b flex items-center justify-start bg-background z-20">
                    <span className="font-bold text-lg">Unislyd</span>
                    <MobileSidebar />
                </div>
                <main className="flex-1 overflow-y-auto">
                    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
