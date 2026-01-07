import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout' // Corrected path based on typical structure or previous context, checking imports
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
