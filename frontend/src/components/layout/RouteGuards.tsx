import { Loader2 } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

// Only signed-in users; everyone else goes to /login.
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)
  if (status === 'loading') return <FullScreenLoader />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

// Only admins; other signed-in users go back to the chat. Nest inside ProtectedRoute.
// This only hides the UI — the backend must still check the role on every admin API call.
export function AdminRoute() {
  const role = useAuthStore((s) => s.user?.role)
  if (role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}

// Only signed-out users (the login page); signed-in users go to the app.
export function GuestRoute() {
  const status = useAuthStore((s) => s.status)
  if (status === 'loading') return <FullScreenLoader />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}
