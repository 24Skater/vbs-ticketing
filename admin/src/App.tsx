import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query';
import { useAuthStore } from './stores/auth';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { EventsPage } from './pages/Events';
import { TicketsPage } from './pages/Tickets';
import { SettingsPage } from './pages/Settings';

function AppRoutes() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/payments" element={<ComingSoon title="Payments" />} />
        <Route path="/users" element={<ComingSoon title="Users" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/branding" element={<ComingSoon title="Branding" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">Coming soon...</p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
