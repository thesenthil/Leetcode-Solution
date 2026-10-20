import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import AuthInitializer from './components/common/AuthInitializer';
import { ThemeProvider } from './context/ThemeProvider';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Feed from './pages/feed/Feed';
import Profile from './pages/profile/Profile';
import Jobs from './pages/jobs/Jobs';
import Connections from './pages/connections/Connections';
import Messaging from './pages/messaging/Messaging';
import Chat from './pages/messaging/Chat';

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <BrowserRouter>
        <AuthInitializer>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }
            }}
          />
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/messaging" element={<Messaging />}>
                <Route path=":recipientId" element={<Chat />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
