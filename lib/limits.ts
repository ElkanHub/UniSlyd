export const RATE_LIMITS = {
    FREE: {
        MAX_DECKS: 5,
        MAX_QUERIES_PER_DAY: 20,
        MAX_QUERIES_PER_MONTH: 300,
    },
    PRO: {
        MAX_DECKS: Infinity,
        MAX_QUERIES_PER_DAY: 500,
        MAX_QUERIES_PER_MONTH: 10000,
    }
} as const
