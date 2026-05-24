import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { LandingPage } from './pages/LandingPage'
import { SignupPage } from './pages/SignupPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ChatsPage } from './pages/ChatsPage'
import { ChatDetailPage } from './pages/ChatDetailPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { FixesPage } from './pages/FixesPage'
import { UploadsPage } from './pages/UploadsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <ChatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats/:chatId"
        element={
          <ProtectedRoute>
            <ChatDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <ReviewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fixes"
        element={
          <ProtectedRoute>
            <FixesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/uploads"
        element={
          <ProtectedRoute>
            <UploadsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
