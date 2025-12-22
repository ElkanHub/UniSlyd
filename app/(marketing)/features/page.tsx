"use client";

import React from 'react';
import {
    FileUp,
    MessageSquare,
    LayoutDashboard,
    Download,
    CheckCircle2,
    HelpCircle,
    ShieldCheck,
    Zap,
    GraduationCap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';
import { cn } from "@/lib/utils"
import { DotPattern } from "@/components/ui/dot-pattern"
import { WordRotate } from '@/components/ui/word-rotate';
import { BorderBeam } from "@/components/ui/border-beam"
import { LightRays } from "@/components/ui/light-rays"

export default function UnislydFeatures() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <LightRays />

            {/* --- KEY FEATURES SECTION --- */}
            <section className="z-10 container mx-auto px-4 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4 inline-block">Powerful Features for <WordRotate words={["Serious", "University"]} /> Students
                    </h2>
                    <p className="text-muted-foreground">Everything you need to know about your slides.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Feature 1 */}
                    <div className="flex gap-6 p-6 rounded-2xl border bg-card">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Smart Slide Upload</h3>
                            <p className="text-muted-foreground mb-3">Stop manually searching through files. Unislyd ingests your lecture materials and understands them.</p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-green-500" /> Supports PPTX & PDF</li>
                                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-green-500" /> Intelligent Content Extraction</li>
                            </ul>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex gap-6 p-6 rounded-2xl border bg-card">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Conversational Study Buddy (AI Chat)</h3>
                            <p className="text-muted-foreground mb-3">Chat with your slides as if they were a tutor. Ask questions like "What did the professor say about Mitochondria?" or "Summarize the key points of Slide 3." All from your own Slides</p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-green-500" /> Natural Language Queries</li>
                                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-green-500" /> Source Grounding (No Hallucinations)</li>
                                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-green-500" /> Context-Aware AI Answers</li>
                            </ul>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex gap-6 p-6 rounded-2xl border bg-card">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Study Organization (Dashboard)</h3>
                            <p className="text-muted-foreground mb-3">Keep your courses organized. View all your uploaded decks and history in one centralized dashboard.</p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-green-500" /> Complete Deck Management</li>
                                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-green-500" /> Saved Conversation History</li>
                            </ul>
                        </div>
                    </div>

                    {/* Feature 4 */}
                    <div className="flex gap-6 p-6 rounded-2xl border bg-card">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Download className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Export & Review</h3>
                            <p className="text-muted-foreground mb-3">Take your study notes offline. Export sessions into high-quality PDFs for revision anywhere.</p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-green-500" /> Editable AI Responses</li>
                                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-green-500" /> Clean PDF Exporting</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MEMBERSHIP TIERS --- */}
            <section className="bg-muted/30 py-24 border-y">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">What Membership Tiers Get You</h2>
                        <p className="text-muted-foreground">Affordable plans designed for a student budget.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-2xl">Free Plan</CardTitle>
                                <CardDescription>Try out the power of AI studying</CardDescription>
                                <div className="text-4xl font-bold pt-4">$0 <span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" /> 5 Slide Decks</li>
                                    <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" /> 20 Queries / Day</li>
                                    <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" /> Core RAG AI Features</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">Current Plan</Button>
                            </CardFooter>
                        </Card>

                        {/* Pro Plan */}
                        <Card className="flex flex-col shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase rounded-bl-lg">Most Popular</div>
                            <CardHeader>
                                <CardTitle className="text-2xl">Pro Plan</CardTitle>
                                <CardDescription>The ultimate study companion</CardDescription>
                                <div className="text-4xl font-bold pt-4">Best Value <Zap className="inline w-6 h-6 text-yellow-500" /></div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2 text-sm font-bold text-primary"><CheckCircle2 className="w-4 h-4" /> Unlimited Slide Decks</li>
                                    <li className="flex items-center gap-2 text-sm font-bold text-primary"><CheckCircle2 className="w-4 h-4" /> Unlimited Queries</li>
                                    <li className="flex items-center gap-2 text-sm font-bold text-primary"><CheckCircle2 className="w-4 h-4" /> Priority Processing</li>
                                    <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" /> Advanced PDF Export</li>
                                </ul>
                                <div className="mt-6 p-4 rounded-xl bg-muted">
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Pro Pricing Options:</p>
                                    <p className="text-sm">Monthly or <span className="text-primary font-bold">Semester Pass</span> (Save Big!)</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full">Upgrade to Pro</Button>
                            </CardFooter>
                            <BorderBeam
                                duration={4}
                                size={500}
                                borderWidth={3}
                                reverse
                                className="from-transparent via-green-500 to-transparent"
                            />
                        </Card>
                    </div>
                </div>
            </section>

            {/* --- FAQ SECTION --- */}
            <section className="container mx-auto px-4 py-24">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
                        <HelpCircle className="text-primary" /> Frequently Asked Questions
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Can I use this for any subject?</AccordionTrigger>
                            <AccordionContent>
                                Yes! As long as you have lecture slides (PPTX or PDF) with text, Unislyd can learn it. It works great for Biology, History, Law, Business, Computer Science, and more.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Is my data private?</AccordionTrigger>
                            <AccordionContent>
                                Yes. Your uploaded slides are processed securely and are only accessible by you.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>How accurate is the AI?</AccordionTrigger>
                            <AccordionContent>
                                Unislyd is "grounded" in your data. Unlike ChatGPT which uses the entire internet, Unislyd prioritizes the information inside the files you upload, making it much more accurate for specific course material and reducing hallucinations.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className=" container mx-auto px-4 py-20 text-center">
                <div className="relative overflow-hidden bg-primary text-primary-foreground rounded-3xl p-12 shadow-2xl">
                    <DotPattern
                        // width={20}
                        // height={20}
                        // glow={true}
                        className={cn(
                            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
                        )}
                    />
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Study smarter, not longer.</h2>
                    <p className="text-xl opacity-90 mb-8">Join thousands of students turning their slides into intelligence.</p>
                    <Button asChild size="lg" variant="secondary" className="px-10 py-6 text-lg font-bold hover:scale-105 transition-transform">
                        <Link href="/signup">Start Using Unislyd Today</Link>
                    </Button>
                </div>
            </section>


        </div>
    );
}