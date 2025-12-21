"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { TextAnimate } from "@/components/ui/text-animate";
import { BrainCircuit, ChevronRight, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    // Track mouse movement for the flashlight effect
    useEffect(() => {
        const updateMousePosition = (ev: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setMousePosition({
                x: ev.clientX - rect.left,
                y: ev.clientY - rect.top,
            });
            // Fade in the effect only when mouse moves
            setOpacity(1);
        };

        window.addEventListener("mousemove", updateMousePosition);
        return () => window.removeEventListener("mousemove", updateMousePosition);
    }, []);

    // Data fragments buried under the fog
    const fragments = [
        { text: "Mitochondria is the...", top: "20%", left: "15%", rotate: "-5deg" },
        { text: "Slide 42: Key Equations...", top: "60%", left: "70%", rotate: "10deg" },
        { text: "PROFESSOR SAID: DON'T FORGET...", top: "30%", left: "80%", rotate: "-2deg" },
        { text: "...cognitive load theory states...", top: "80%", left: "25%", rotate: "3deg" },
        { text: "ERROR: MEMORY LEAK", top: "50%", left: "40%", rotate: "0deg" },
        { text: "AAAAH Class is too BOOORING", top: "30%", left: "10%", rotate: "0deg" },
        { text: "LOOK BEHIND YOU", top: "50%", left: "60%", rotate: "15deg" },
    ];

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center text-center p-6"
        >

            {/* --- Layer 1: The "Lost Data" (Underneath) --- */}
            {/* These are only visible when the flashlight hits them */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none">
                {fragments.map((frag, i) => (
                    <div
                        key={i}
                        className="absolute text-muted-foreground/30 font-mono text-sm md:text-lg whitespace-nowrap blur-[1px]"
                        style={{ top: frag.top, left: frag.left, transform: `rotate(${frag.rotate})` }}
                    >
                        {frag.text}
                    </div>
                ))}
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            </div>


            {/* --- Layer 2: The Fog/Flashlight Mask --- */}
            {/* This layer covers everything in darkness EXCEPT where the mouse is */}
            <div
                className="absolute inset-0 z-10 bg-black transition-opacity duration-500"
                style={{
                    opacity: opacity,
                    // This is the magic radial gradient mask
                    maskImage: `radial-gradient(
            circle 300px at ${mousePosition.x}px ${mousePosition.y}px,
            transparent 10%,
            black 80%
          )`,
                    WebkitMaskImage: `radial-gradient(
            circle 300px at ${mousePosition.x}px ${mousePosition.y}px,
            transparent 0%,
            black 100%
          )`
                }}
            ></div>


            {/* --- Layer 3: The UI Overlay (Always Visible) --- */}
            <div className="z-20 relative max-w-3xl mx-auto space-y-8 pointer-events-none">

                {/* Top Icon */}
                <div className="animate-in fade-in slide-in-from-top-5 duration-1000 flex justify-center opacity-50">
                    <BrainCircuit className="w-16 h-16 text-muted-foreground/50" />
                </div>

                {/* Main Headline */}
                <div className="space-y-2">
                    <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mix-blend-difference">
                        404
                    </h1>
                    <TextAnimate animation="blurIn" as="h2" className="text-2xl md:text-4xl font-medium text-white/90 tracking-tight">
                        Drawing a blank.
                    </TextAnimate>
                </div>

                {/* Description */}
                <p className="text-lg text-muted-foreground/80 max-w-md mx-auto leading-relaxed animate-in fade-in duration-1000 delay-300">
                    We searched your cognitive drive, but this page seems to have fragmented. It's like that one fact you needed during the midterm—gone.
                </p>

                {/* Interaction Hint */}
                <div className="py-8 animate-pulse flex items-center justify-center gap-2 text-sm text-muted-foreground/50">
                    <SearchX className="w-4 h-4" /> Move your cursor to focus memory...
                </div>

                {/* CTA - pointer-events-auto is needed because the parent has pointer-events-none */}
                <div className="pt-4 pointer-events-auto animate-in fade-in duration-1000 delay-500">
                    <Link href="/">
                        <ShimmerButton className="shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] mx-auto transition-transform hover:scale-[1.02]">
                            <span className="text-base font-semibold px-8 flex items-center gap-2">
                                Return to Dashboard <ChevronRight className="w-4 h-4 opacity-50" />
                            </span>
                        </ShimmerButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}