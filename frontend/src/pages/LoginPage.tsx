import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { Loader2, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { getErrorMessage } from '@/api/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

export default function LoginPage() {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const sessionError = useAuthStore((s) => s.sessionError)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // After success the store becomes 'authenticated' and GuestRoute redirects to "/".
  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) {
      setError('Google did not return a credential. Please try again.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await loginWithGoogle(response.credential)
    } catch (err) {
      setError(getErrorMessage(err, 'Sign-in failed. Please try again.'))
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm py-8">
        <CardHeader className="items-center justify-items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <MessageCircle className="size-6" />
          </div>
          <CardTitle className="text-xl font-semibold">Welcome to Message App</CardTitle>
          <CardDescription>Sign in to start chatting with your team</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4 pt-2">
          {!hasGoogleClientId ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              Google sign-in is not configured. Set <code>VITE_GOOGLE_CLIENT_ID</code> in{' '}
              <code>frontend/.env</code> and restart the dev server.
            </p>
          ) : submitting ? (
            <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Signing you in...
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('Google sign-in was cancelled or failed.')}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
              width={300}
            />
          )}

          {(error ?? sessionError) && <p className="text-center text-sm text-destructive">{error ?? sessionError}</p>}

          <p className="text-center text-xs text-muted-foreground">
            New accounts need admin approval before they can start chatting.
            <br />
            We only use your Google name, email and profile picture.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
