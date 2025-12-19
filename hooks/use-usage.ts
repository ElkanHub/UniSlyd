import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useUsage() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['usage'],
        queryFn: async () => {
            // 1. Get Decks Count
            const { count: deckCount, error: deckError } = await supabase
                .from('decks')
                .select('*', { count: 'exact', head: true })

            if (deckError) throw deckError

            // 2. Get Query Count (This month)
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
            const { data: queryLog, error: logError } = await supabase
                .from('usage_logs')
                .select('count')
                .eq('metric', 'query')
                .gte('created_at', startOfMonth) // Approximate logic, ideally filter by bucket_month

            const queryCount = queryLog ? queryLog.reduce((acc, curr) => acc + curr.count, 0) : 0

            // 3. Get User Tier
            const { data: { user } } = await supabase.auth.getUser()
            const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user?.id).single()

            return {
                deckCount: deckCount || 0,
                queryCount: queryCount,
                tier: profile?.tier || 'free',
                isPro: profile?.tier?.startsWith('pro'),
                limits: {
                    maxDecks: profile?.tier?.startsWith('pro') ? Infinity : 5,
                    maxQueries: profile?.tier?.startsWith('pro') ? Infinity : 10
                }
            }
        }
    })
}
