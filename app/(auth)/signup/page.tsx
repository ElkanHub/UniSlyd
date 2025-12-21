import { signup, signInWithGoogle } from '../actions'
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

                {searchParams?.message ? (
                    <div className="flex flex-col items-center text-center space-y-4 py-4">
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Check your email</h3>
                            <p className="text-muted-foreground text-sm">
                                {searchParams.message}
                            </p>
                        </div>
                        <Button asChild className="w-full mt-4">
                            <Link href="/login">Return to Login</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        {searchParams?.error && (
                            <div className="p-3 rounded bg-destructive/15 text-destructive text-sm font-medium text-center">
                                {searchParams.error}
                            </div>
                        )}

                        <form action={signInWithGoogle} className="w-full">
                            <Button variant="outline" className="w-full" type="submit">
                                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                                Sign up with Google
                            </Button>
                        </form>

                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

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
                    </>
                )}
            </div>
        </div>
    )
}
