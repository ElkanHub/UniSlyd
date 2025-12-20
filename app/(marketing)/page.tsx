import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate"
import { WordRotate } from "@/components/ui/word-rotate"
import {
    ScrollVelocityContainer,
    ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";
import { ShimmerButton } from "@/components/ui/shimmer-button"

export default function StudyAILanding() {
    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
            {/* 1. SCROLL PROGRESS - Shows the user their "study progress" through the page */}
            {/* <ScrollProgress className="top-0 h-1 bg-primary" /> */}

            <section className="relative space-y-8 pb-12 pt-16 md:pb-20 md:pt-24 lg:py-32">
                <div className="container flex max-w-[66rem] flex-col items-center gap-6 text-center">

                    {/* 2. TEXT ANIMATE (Blur In) - The first thing they see */}
                    <TextAnimate animation="blurIn" as="h1" className="text-sm font-semibold tracking-widest uppercase text-primary/80"
                    >
                        Your slides shouldn't be a maze.
                    </TextAnimate>

                    {/* 3. ROTATE TEXT - Highlighting different student struggles */}
                    <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight">
                        Nail your
                        <WordRotate
                            className="text-primary block sm:inline-block px-2"
                            words={["Midterms", "Finals", "Quizzes", "Exams", "Projects", "Presentations"]}
                        />
                        without the 2 AM panic.
                    </h1>

                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                        Stop digging through a 150-slide deck for one specific bullet point.
                        Upload your lectures and get answers sourced <strong>only</strong> from what your professor actually taught.
                    </p>

                    {/* 4. SHIMMER BUTTON - The high-conversion CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <Link href="/signup">
                            <ShimmerButton className="shadow-2xl transition-transform hover:scale-105">
                                <span className="text-center text-sm font-semibold leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                                    Start Studying for Free
                                </span>
                            </ShimmerButton>
                        </Link>
                        <Link href="#how-it-works">
                            <Button size="lg" variant="ghost" className="rounded-full underline">
                                See it in action
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 5. SCROLL BASED VELOCITY - Relatable "Student Truths" moving across the screen */}
            <div className="py-10 border-y bg-muted/30">
                {/* <VelocityScroll
                    text="No more CTRL+F nightmares • Exam-accurate answers • Sourced from your slides • Study smarter, not longer •"
                    default_velocity={2}
                    className="font-display text-center text-2xl font-bold tracking-[-0.02em] text-primary/20 md:text-5xl md:leading-[5rem]"
                /> */}
                <ScrollVelocityContainer className="text-4xl font-bold md:text-7xl">
                    <ScrollVelocityRow baseVelocity={3} direction={1}>
                        No more CTRL+F nightmares • Exam-accurate answers •
                    </ScrollVelocityRow>
                    <ScrollVelocityRow baseVelocity={3} direction={-1}>
                        Sourced from your slides • Study smarter, not longer •
                    </ScrollVelocityRow>
                </ScrollVelocityContainer>
            </div>

            {/* Relatable Content Section */}
            <section className="container py-24 space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold">Built for the way you actually study.</h2>
                        <p className="text-lg text-muted-foreground">
                            Generic AI hallucinates. We don't. Our engine locks onto <strong>your</strong> specific course material, so you never have to worry about "fake" information on an exam.
                        </p>
                        <ul className="space-y-3 font-medium">
                            <li className="flex items-center gap-2">
                                <span className="text-primary">✓</span> "Where did the prof mention the Krebs cycle?"
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-primary">✓</span> "Summarize week 4 slides into 5 bullet points."
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-primary">✓</span> "Create a practice quiz from this PDF."
                            </li>
                        </ul>
                    </div>
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-dashed flex items-center justify-center">
                        {/* This would be where you place an image or video of the tool */}
                        <p className="text-muted-foreground font-mono">[ Interactive UI Preview ]</p>
                    </div>
                </div>
            </section>
        </div>
    );
}