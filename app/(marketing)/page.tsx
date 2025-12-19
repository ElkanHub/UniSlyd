import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
    return (
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
                    Turn your lecture slides into an AI you can study with.
                </h1>
                <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                    Upload your class slides. Ask questions. Get precise answers sourced directly from your lectures. Built for students, not generic AI.
                </p>
                <div className="space-x-4">
                    <Link href="/signup">
                        <Button size="lg">Get Started Free</Button>
                    </Link>
                    <Link href="#features">
                        <Button size="lg" variant="outline">
                            See How It Works
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
