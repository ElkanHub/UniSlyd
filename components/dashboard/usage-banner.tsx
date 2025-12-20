'use client'

import { useUsage } from '@/hooks/use-usage'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Sparkles, AlertCircle } from 'lucide-react'
import { ShinyButton } from "@/components/ui/shiny-button"

export function UsageBanner() {
    const { data: usage, isLoading } = useUsage()

    if (isLoading || !usage || usage.isPro) return null

    // For Free users, show Daily Queries as the primary metric if closer to limit, or just show both
    // Actually, per implementation plan, show Daily specifically requested by user.

    const deckPercent = (usage.deckCount / usage.limits.maxDecks) * 100
    const dailyQueryPercent = (usage.dailyCount / usage.limits.maxQueriesDaily) * 100
    // const monthlyQueryPercent = (usage.monthlyCount / usage.limits.maxQueriesMonthly) * 100

    const isCritical = deckPercent >= 100 || dailyQueryPercent >= 100

    return (
        <div className="p-4 m-4 rounded-xl border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Free Plan
                </h3>
                {isCritical && <span className="text-xs text-destructive font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Limit Reached</span>}
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Decks</span>
                        <span>{usage.deckCount} / {usage.limits.maxDecks}</span>
                    </div>
                    <Progress value={deckPercent} className="h-2" indicatorColor={deckPercent >= 100 ? "bg-destructive" : "bg-primary"} />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Daily Queries</span>
                        <span>{usage.dailyCount} / {usage.limits.maxQueriesDaily}</span>
                    </div>
                    <Progress value={dailyQueryPercent} className="h-2" indicatorColor={dailyQueryPercent >= 100 ? "bg-destructive" : "bg-primary"} />
                </div>
            </div>

            <ShinyButton className="w-full text-xs">
                Upgrade to Pro
            </ShinyButton>
        </div>
    )
}
