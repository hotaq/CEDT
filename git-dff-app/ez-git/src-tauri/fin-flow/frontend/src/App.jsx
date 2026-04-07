import './index.css'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import CapturePage from './pages/CapturePage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="nav">
          <a href="/" className="nav-logo">📄 <span>Smart</span>Budget</a>
          <div className="nav-links">
            <NavLink to="/" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')} end>
              📷 Capture
            </NavLink>
            <NavLink to="/dashboard" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              📊 Dashboard
            </NavLink>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<CapturePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
