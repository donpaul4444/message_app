import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute, GuestRoute, PendingRoute, ProtectedRoute } from '@/components/layout/RouteGuards'
import AdminPage from '@/pages/AdminPage'
import ChatPage from '@/pages/ChatPage'
import LoginPage from '@/pages/LoginPage'
import PendingPage from '@/pages/PendingPage'
import { useAuthStore } from '@/store/authStore'

function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  useEffect(() => {
    checkSession()
  }, [checkSession])

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<PendingRoute />}>
        <Route path="/pending" element={<PendingPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ChatPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
