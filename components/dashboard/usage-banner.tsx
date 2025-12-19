'use client'

import { useUsage } from '@/hooks/use-usage'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Sparkles, AlertCircle } from 'lucide-react'

export function UsageBanner() {
    const { data: usage, isLoading } = useUsage()

    if (isLoading || !usage || usage.isPro) return null

    const deckPercent = (usage.deckCount / usage.limits.maxDecks) * 100
    const queryPercent = (usage.queryCount / usage.limits.maxQueries) * 100
    const isCritical = deckPercent >= 100 || queryPercent >= 100

    return (
        <div className="p-4 m-4 rounded-xl border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Free Plan
                </h3>
                {isCritical && <span className="text-xs text-destructive font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Limit Reached</span>}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Decks</span>
                    <span>{usage.deckCount} / {usage.limits.maxDecks}</span>
                </div>
                <Progress value={deckPercent} className="h-2" indicatorColor={deckPercent >= 100 ? "bg-destructive" : "bg-primary"} />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Queries (Monthly)</span>
                    <span>{usage.queryCount} / {usage.limits.maxQueries}</span>
                </div>
                <Progress value={queryPercent} className="h-2" indicatorColor={queryPercent >= 100 ? "bg-destructive" : "bg-primary"} />
            </div>

            <Button className="w-full text-xs" size="sm" variant="default">
                Upgrade to Pro
            </Button>
        </div>
    )
}
