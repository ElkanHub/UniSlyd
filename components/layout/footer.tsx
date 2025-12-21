import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    {/* Your Logo or Brand Name */}
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built for students by people who've been there. © 2025 StudyAI.
                    </p>
                </div>

                {/* Quick Links */}
                <nav className="flex items-center space-x-6 text-sm font-medium text-muted-foreground">
                    <Link href="#features" className="transition-colors hover:text-primary">
                        Features
                    </Link>
                    <Link href="/privacy" className="transition-colors hover:text-primary">
                        Privacy
                    </Link>
                    <Link href="/terms" className="transition-colors hover:text-primary">
                        Terms
                    </Link>
                    <Link
                        href="https://github.com/ElkanHub/UniSlyd"
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors hover:text-primary"
                    >
                        GitHub
                    </Link>
                </nav>
            </div>
        </footer>
    );
}