import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { RATE_LIMITS } from '@/lib/limits'

export function useUsage() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['usage'],
        queryFn: async () => {
            const now = new Date()

            // 1. Get Decks Count
            const { count: deckCount, error: deckError } = await supabase
                .from('decks')
                .select('*', { count: 'exact', head: true })

            if (deckError) throw deckError

            // 2. Get User Tier
            const { data: { user } } = await supabase.auth.getUser()
            const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user?.id).single()

            const userTierKey = (profile?.tier === 'pro' || profile?.tier === 'pro_plus') ? 'PRO' : 'FREE'
            const limits = RATE_LIMITS[userTierKey]

            // 3. Get Query Count (This month AND Today)
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

            // Ideally use RPC for aggregation to save reads, but simple select is fine for now
            const { data: queryLog } = await supabase
                .from('usage_logs')
                .select('count, created_at')
                .eq('metric', 'query')
                .gte('created_at', startOfMonth)

            const monthlyCount = queryLog ? queryLog.reduce((acc, curr) => acc + curr.count, 0) : 0

            // Filter daily from the same dataset if possible, or simple check
            const dailyCount = queryLog
                ? queryLog.filter(l => l.created_at >= startOfDay).reduce((acc, curr) => acc + curr.count, 0)
                : 0

            return {
                deckCount: deckCount || 0,
                queryCount: monthlyCount, // Legacy naming for backward compat if needed, or update consumers
                monthlyCount: monthlyCount,
                dailyCount: dailyCount,
                tier: profile?.tier || 'free',
                isPro: userTierKey === 'PRO',
                limits: {
                    maxDecks: limits.MAX_DECKS,
                    maxQueriesMonthly: limits.MAX_QUERIES_PER_MONTH,
                    maxQueriesDaily: limits.MAX_QUERIES_PER_DAY
                }
            }
        }
    })
}
