import { getResearchSession, getResearchMessages, getDecks } from "@/app/actions/research"
import { notFound } from "next/navigation"
import { ResearchInterface } from "@/components/research/research-interface"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: { id: string }
}

export default async function ResearchWorkspacePage({ params }: PageProps) {
    const { id } = await params
    const session = await getResearchSession(id)
    const messages = await getResearchMessages(id)
    const decks = await getDecks()

    if (!session) {
        notFound()
    }

    return (
        <ResearchInterface
            session={session}
            messages={messages as any[]} // cast role or type
            decks={decks || []}
        />
    )
}
