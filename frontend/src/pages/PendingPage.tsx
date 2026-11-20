import { Clock, Loader2, LogOut, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

const POLL_MS = 15_000

// Shown after Google sign-in until an admin approves the account.
// Re-checks the status periodically; PendingRoute redirects to the app once approved.
export default function PendingPage() {
  const user = useAuthStore((s) => s.user)
  const checkSession = useAuthStore((s) => s.checkSession)
  const logout = useAuthStore((s) => s.logout)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const id = setInterval(checkSession, POLL_MS)
    return () => clearInterval(id)
  }, [checkSession])

  async function checkNow() {
    setChecking(true)
    await checkSession()
    setChecking(false)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm py-8">
        <CardHeader className="items-center justify-items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Clock className="size-6" />
          </div>
          <CardTitle className="text-xl font-semibold">Waiting for approval</CardTitle>
          <CardDescription>
            Your request to join has been sent to the admin. You'll get access as soon as it's approved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-lg bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={logout}>
              <LogOut />
              Log out
            </Button>
            <Button className="flex-1" onClick={checkNow} disabled={checking}>
              {checking ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Check again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
