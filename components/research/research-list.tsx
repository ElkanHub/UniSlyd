"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { ResearchRow } from "./research-row"
import { searchResearchSessions } from "@/app/actions/research"
import { useInView } from "react-intersection-observer"

export function ResearchList() {
    const [query, setQuery] = useState("")
    const [sessions, setSessions] = useState<any[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [initialLoaded, setInitialLoaded] = useState(false)

    // Intersection observer for infinite scroll
    const { ref, inView } = useInView()

    useEffect(() => {
        if (inView && hasMore && !isLoading) {
            loadMore()
        }
    }, [inView, hasMore, isLoading])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1)
            fetchSessions(1, query, true)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const fetchSessions = async (pageNum: number, searchQuery: string, reset: boolean = false) => {
        setIsLoading(true)
        try {
            const { data, total } = await searchResearchSessions({
                query: searchQuery,
                page: pageNum,
                limit: 15
            })

            if (reset) {
                setSessions(data || [])
            } else {
                setSessions(prev => [...prev, ...(data || [])])
            }

            setHasMore((data?.length || 0) === 15)
            setInitialLoaded(true)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadMore = () => {
        if (!isLoading && hasMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchSessions(nextPage, query)
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search research sessions..."
                    className="pl-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pb-4">
                {sessions.map((session) => (
                    <ResearchRow key={session.id} session={session} />
                ))}

                {sessions.length === 0 && initialLoaded && !isLoading && (
                    <div className="text-center py-10 text-muted-foreground">
                        No research sessions found.
                    </div>
                )}

                {hasMore && (
                    <div ref={ref} className="py-4 flex justify-center">
                        <button
                            onClick={loadMore}
                            disabled={isLoading}
                            className="text-sm text-muted-foreground hover:text-primary disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
