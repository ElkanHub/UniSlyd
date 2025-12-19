import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DeckCard } from '@/components/dashboard/deck-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from 'lucide-react'

export const metadata = {
    title: 'My Decks | Unislyd',
    description: 'View and manage your study materials',
}

export default async function DecksPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. Fetch Profile for Tier
    const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single()

    const userTier = profile?.tier || 'free'

    // 2. Fetch Decks
    const { data: decks } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const allDecks = decks || []

    // 3. Categorize
    const categorized = {
        all: allDecks,
        presentations: allDecks.filter(d => d.filename.toLowerCase().endsWith('.pptx')),
        documents: allDecks.filter(d => d.filename.toLowerCase().endsWith('.docx')),
        pdfs: allDecks.filter(d => d.filename.toLowerCase().endsWith('.pdf')),
        text: allDecks.filter(d => d.filename.toLowerCase().endsWith('.txt')),
    }

    return (
        <div className="flex flex-col h-full gap-6 p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Decks</h1>
                    <p className="text-muted-foreground">
                        Manage your uploaded study materials.
                    </p>
                </div>
            </div>

            {userTier === 'free' && (
                <Alert className="bg-muted/50">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Free Tier Limitation</AlertTitle>
                    <AlertDescription>
                        You are on the Free plan. Manual deletion is disabled. 
                        Files are automatically cleaned up at the start of every month. 
                        Upgrade to Pro for unlimited storage controls.
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All ({categorized.all.length})</TabsTrigger>
                    <TabsTrigger value="pptx">Slides ({categorized.presentations.length})</TabsTrigger>
                    <TabsTrigger value="pdf">PDFs ({categorized.pdfs.length})</TabsTrigger>
                    <TabsTrigger value="docx">Docs ({categorized.documents.length})</TabsTrigger>
                    <TabsTrigger value="txt">Text ({categorized.text.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                   <DeckGrid decks={categorized.all} userTier={userTier} emptyMsg="No decks found." />
                </TabsContent>
                <TabsContent value="pptx" className="space-y-4">
                    <DeckGrid decks={categorized.presentations} userTier={userTier} emptyMsg="No presentations found." />
                </TabsContent>
                <TabsContent value="pdf" className="space-y-4">
                    <DeckGrid decks={categorized.pdfs} userTier={userTier} emptyMsg="No PDFs found." />
                </TabsContent>
                <TabsContent value="docx" className="space-y-4">
                    <DeckGrid decks={categorized.documents} userTier={userTier} emptyMsg="No Word documents found." />
                </TabsContent>
                <TabsContent value="txt" className="space-y-4">
                    <DeckGrid decks={categorized.text} userTier={userTier} emptyMsg="No text files found." />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function DeckGrid({ decks, userTier, emptyMsg }: { decks: any[], userTier: string, emptyMsg: string }) {
    if (decks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
                <p className="text-muted-foreground">{emptyMsg}</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {decks.map((deck) => (
                <DeckCard key={deck.id} deck={deck} userTier={userTier} />
            ))}
        </div>
    )
}
