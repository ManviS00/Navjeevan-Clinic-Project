import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import VoiceChatBot from './components/VoiceChatBot';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import DoctorApp from './DoctorApp';
import AssistantApp from './AssistantApp';
import type { AppPage } from './types';

type AuthModalMode = 'login' | 'signup' | null;

function AppInner() {
  const [page, setPage] = useState<AppPage>('home');
  const [authModal, setAuthModal] = useState<AuthModalMode>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'login') {
      setAuthModal('login');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  function navigate(p: AppPage) {
    setPage(p);
  }

  const noChromePages: AppPage[] = ['admin', 'dashboard'];

  return (
    <div className="min-h-screen font-sans">
      {!noChromePages.includes(page) && (
        <Navbar
          currentPage={page}
          onNavigate={navigate}
          onOpenLogin={() => setAuthModal('login')}
          onOpenSignup={() => setAuthModal('signup')}
        />
      )}

      <main>
        {page === 'home' && <HomePage onNavigate={navigate} onOpenLogin={() => setAuthModal('login')} />}
        {page === 'services' && <ServicesPage onNavigate={navigate} />}
        {page === 'about' && <AboutPage onNavigate={navigate} />}
        {page === 'contact' && <ContactPage />}
        {page === 'booking' && <BookingPage onNavigate={navigate} onOpenLogin={() => setAuthModal('login')} />}
        {page === 'dashboard' && <DashboardPage onNavigate={navigate} onOpenLogin={() => setAuthModal('login')} />}
        {page === 'admin' && <AdminPage onNavigate={navigate} />}
      </main>

      {!noChromePages.includes(page) && (
        <Footer onNavigate={navigate} />
      )}

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitchMode={(m) => setAuthModal(m)}
          onSuccess={(role) => {
            setAuthModal(null);
            if (role === 'admin') {
              navigate('admin');
            } else if (role === 'doctor') {
              window.location.href = '/doctor';
            } else {
              navigate('dashboard');
            }
          }}
        />
      )}

      {page !== 'admin' && <VoiceChatBot />}
    </div>
  );
}

function MainSite() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/doctor/*" element={<DoctorApp />} />
        <Route path="/assistant" element={<AssistantApp />} />
        <Route path="/*" element={<MainSite />} />
      </Routes>
    </BrowserRouter>
  );
}
