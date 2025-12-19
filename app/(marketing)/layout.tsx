export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="container z-40 bg-background">
                <div className="flex h-20 items-center justify-between py-6">
                    {/* Navigation will go here */}
                    <div className="flex gap-6 md:gap-10">
                        <a href="/" className="flex items-center space-x-2">
                            <span className="inline-block font-bold">Unislyd</span>
                        </a>
                    </div>
                </div>
            </header>
            <main className="flex-1">{children}</main>
        </div>
    )
}
