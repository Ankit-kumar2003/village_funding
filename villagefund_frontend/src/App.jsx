import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Transparency from './pages/Transparency';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Leaderboard from './pages/Leaderboard';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import SSOLogin from './pages/SSOLogin';

// Protected/User Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ThankYou from './pages/ThankYou';
import PaymentStatus from './pages/PaymentStatus';
import Notifications from './pages/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AuditLog from './pages/admin/AuditLog';
import ReserveManagement from './pages/admin/ReserveManagement';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
            <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/transparency" element={<Transparency />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/sso-login" element={<SSOLogin />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
              <Route path="/payment-status" element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'TREASURER']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/audit-log" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AuditLog /></ProtectedRoute>} />
              <Route path="/admin/reserve" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ReserveManagement /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
