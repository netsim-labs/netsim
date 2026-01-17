import ReactDOM from 'react-dom/client'
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import 'reactflow/dist/style.css';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

// Lazy load route components for code splitting
const App = lazy(() => import('./App.tsx'));
// const AdminApp = lazy(() => import('./admin/AdminApp').then(m => ({ default: m.AdminApp })));
// const ChatPage = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-[#0b0c0d]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-zinc-400 text-sm">Loading...</span>
    </div>
  </div>
);

const RootHandlers = () => {
  const { initListener } = useAuthStore();

  useEffect(() => {
    initListener();

    // Recovery for when OAuth redirects to root instead of /admin
    if (window.location.pathname === '/' && window.location.hash.includes('access_token') && localStorage.getItem('netsim-redirect-target') === 'admin') {
      localStorage.removeItem('netsim-redirect-target');
      window.location.href = '/admin' + window.location.hash;
    }
  }, [initListener]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* <Route path="/admin/*" element={<AdminApp />} /> */}
          {/* <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } /> */}
          <Route path="/*" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RootHandlers />
)
