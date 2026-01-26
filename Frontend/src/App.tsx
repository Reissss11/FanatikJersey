import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import Profile from './pages/Profile/Profile'
import ProtectedRoute from './components/Shared/ProtectedRoute'
import HomeRedirect from './components/Shared/HomeRedirect'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminPanel from './pages/Admin/AdminPanel'
import LeagueManager from './pages/Admin/LeagueManager'
import TeamManager from './pages/Admin/TeamManager'
import JerseyManager from './pages/Admin/JerseyManager'
import PricingManager from './pages/Admin/PricingManager'
import JerseyDetails from './pages/Jersey/JerseyDetails'
import Catalog from './pages/Catalog/Catalog'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><HomeRedirect /></Layout>} />
              <Route path="/jerseys/:id" element={<Layout><JerseyDetails /></Layout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
              <Route path="/admin/panel" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><AdminPanel /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/leagues" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><LeagueManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/teams" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><TeamManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/jerseys" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><JerseyManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/pricing" element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><PricingManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
