import { createResearchSession } from "@/app/actions/research"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ResearchList } from "@/components/research/research-list"

export const dynamic = 'force-dynamic'

export default function ResearchDashboard() {

    return (
        <div className="flex-1 w-full flex flex-col p-6 h-full overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Research Zone</h1>
                    <p className="text-muted-foreground mt-1">
                        Deep dive into your decks with focused AI assistance and rich note-taking.
                    </p>
                </div>
                <form action={async () => {
                    'use server'
                    await createResearchSession()
                }}>
                    <Button type="submit">
                        <Plus className="w-4 h-4 mr-2" />
                        New Research
                    </Button>
                </form>
            </div>

            <ResearchList />
        </div>
    )
}
