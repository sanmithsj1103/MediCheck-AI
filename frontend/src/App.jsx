import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected pages
import DashboardPage from './pages/DashboardPage';
import MedicalProfilePage from './pages/MedicalProfilePage';
import SymptomInputPage from './pages/SymptomInputPage';
import TextChatPage from './pages/TextChatPage';
import VoiceChatPage from './pages/VoiceChatPage';
import QuickSelectPage from './pages/QuickSelectPage';
import TriageResultsPage from './pages/TriageResultsPage';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import AssessmentHistoryPage from './pages/AssessmentHistoryPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#0F172A',
              color: '#F8FAFC',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#F43F5E', secondary: '#FFFFFF' },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (with sidebar layout) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
            <Route path="/profile" element={<ErrorBoundary><MedicalProfilePage /></ErrorBoundary>} />
            <Route path="/symptom-input" element={<ErrorBoundary><SymptomInputPage /></ErrorBoundary>} />
            <Route path="/symptom-input/text" element={<ErrorBoundary><TextChatPage /></ErrorBoundary>} />
            <Route path="/symptom-input/voice" element={<ErrorBoundary><VoiceChatPage /></ErrorBoundary>} />
            <Route path="/symptom-input/quick-select" element={<ErrorBoundary><QuickSelectPage /></ErrorBoundary>} />
            <Route path="/results/:assessmentId" element={<ErrorBoundary><TriageResultsPage /></ErrorBoundary>} />
            <Route path="/book-appointment/:assessmentId" element={<ErrorBoundary><AppointmentBookingPage /></ErrorBoundary>} />
            <Route path="/history" element={<ErrorBoundary><AssessmentHistoryPage /></ErrorBoundary>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
