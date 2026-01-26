import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout' // Corrected path based on typical structure or previous context, checking imports
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Profile from './pages/Profile/Profile'
import ProtectedRoute from './components/Shared/ProtectedRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* The Layout component is now applied within each Route's element */}
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
