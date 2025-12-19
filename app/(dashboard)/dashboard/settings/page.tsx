import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your account and subscription.</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <div className="p-6 border rounded-lg bg-card space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Profile</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-muted-foreground">Email</div>
                        <div>{user.email}</div>

                        <div className="text-muted-foreground">Full Name</div>
                        <div>{profile?.full_name || 'Not set'}</div>

                        <div className="text-muted-foreground">User ID</div>
                        <div className="font-mono text-xs">{user.id}</div>
                    </div>
                </div>

                <div className="p-6 border rounded-lg bg-card space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Subscription</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Current Plan</div>
                            <div className="text-sm text-muted-foreground capitalize">{profile?.tier?.replace('_', ' ') || 'Free'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
