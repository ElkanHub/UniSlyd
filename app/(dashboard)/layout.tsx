import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
