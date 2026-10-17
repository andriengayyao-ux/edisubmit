import { Component, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { PublicLayout, AppShell } from './components/Layouts.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { Spinner } from './components/ui.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/AuthPages.jsx').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('./pages/AuthPages.jsx').then((module) => ({ default: module.Register })));
const ForgotPassword = lazy(() => import('./pages/AuthPages.jsx').then((module) => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/AuthPages.jsx').then((module) => ({ default: module.ResetPassword })));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Tasks = lazy(() => import('./pages/Tasks.jsx'));
const CalendarPage = lazy(() => import('./pages/CalendarPage.jsx'));
const Deadlines = lazy(() => import('./pages/Deadlines.jsx'));
const Planner = lazy(() => import('./pages/Planner.jsx'));
const Focus = lazy(() => import('./pages/Focus.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

class RouteErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Unable to load this page.', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-4 text-center">
          <div className="card space-y-3">
            <h1 className="text-xl font-bold">This page couldn’t be loaded</h1>
            <p className="text-sm text-muted">Check your connection and try loading the page again.</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>Reload page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { pathname } = useLocation();
  return (
    <RouteErrorBoundary key={pathname}>
      <Suspense fallback={<Spinner label="Loading page…" />}>
        <Routes>
          {/* Public pages (reachable while signed out, including the Privacy Policy) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          {/* Private pages: login required */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/deadlines" element={<Deadlines />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}
