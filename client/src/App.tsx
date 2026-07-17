import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { TimerProvider } from './context/TimerContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { TodayTasks } from './pages/TodayTasks';
import { CalendarPage } from './pages/CalendarPage';
import { Reports } from './pages/Reports';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { RecurringTasks } from './pages/RecurringTasks';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <TimerProvider>
            <BrowserRouter>
              <Routes>
                {/* Main App Shell Layout (Protected) */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/today" element={<TodayTasks />} />
                  <Route path="/recurring" element={<RecurringTasks />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Authentication Panel (Public/Guest) */}
                <Route element={<AuthLayout />}>
                  <Route path="/auth" element={<Auth />} />
                </Route>

                {/* Fallback Redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </TimerProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
