import { login } from '../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/20">
            <div className="mx-auto grid w-[350px] gap-6 p-6 border rounded-xl bg-background shadow-sm">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Unislyd</h1>
                    <p className="text-balance text-muted-foreground">
                        Login to continue studying
                    </p>
                </div>

                {searchParams?.error && (
                    <div className="p-3 rounded bg-destructive/15 text-destructive text-sm font-medium text-center">
                        {searchParams.error}
                    </div>
                )}

                <form action={login} className="grid gap-4">
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
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="#"
                                className="ml-auto inline-block text-sm underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}
