import { signup } from '../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'

export default function SignupPage({ searchParams }: { searchParams: { error?: string, message?: string } }) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/20">
            <div className="mx-auto grid w-[350px] gap-6 p-6 border rounded-xl bg-background shadow-sm">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Unislyd</h1>
                    <p className="text-balance text-muted-foreground">
                        Create an account to start
                    </p>
                </div>

                {searchParams?.message && (
                    <div className="p-3 rounded bg-green-500/15 text-green-600 text-sm font-medium text-center border border-green-200">
                        {searchParams.message}
                    </div>
                )}

                {searchParams?.error && (
                    <div className="p-3 rounded bg-destructive/15 text-destructive text-sm font-medium text-center">
                        {searchParams.error}
                    </div>
                )}

                <form action={signup} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Sign Up
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
