
'use client'

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
          <div className="bg-white p-12 rounded-3xl shadow-2xl border max-w-md w-full space-y-6">
            <div className="bg-destructive/10 p-4 rounded-full w-fit mx-auto">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold font-headline">Something went wrong</h1>
              <p className="text-muted-foreground text-sm">
                A critical error occurred. Our engineers have been notified.
              </p>
            </div>
            {error.digest && (
              <div className="bg-muted p-2 rounded text-[10px] font-mono text-muted-foreground break-all">
                ID: {error.digest}
              </div>
            )}
            <Button 
              onClick={() => reset()} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
