'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, Check } from 'lucide-react'

interface UpgradeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
                        Upgrade to Pro
                    </DialogTitle>
                    <DialogDescription>
                        Unlock the full power of Unislyd for your studies.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Unlimited Slide Decks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Unlimited Exam Mode Queries</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">200MB File Uploads</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="border rounded-lg p-3 hover:border-primary cursor-pointer transition-colors relative">
                            <div className="text-xs text-muted-foreground uppercase font-bold">Monthly</div>
                            <div className="text-2xl font-bold">₵25<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        </div>
                        <div className="border rounded-lg p-3 border-primary bg-primary/5 cursor-pointer transition-colors relative">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-bl-lg rounded-tr-lg font-bold">
                                BEST VALUE
                            </div>
                            <div className="text-xs text-muted-foreground uppercase font-bold">Semester</div>
                            <div className="text-2xl font-bold">₵120<span className="text-sm font-normal text-muted-foreground">/4mo</span></div>
                        </div>
                    </div>
                </div>

                <Button className="w-full font-bold" size="lg">
                    Pay with Mobile Money / Card
                </Button>
            </DialogContent>
        </Dialog>
    )
}
