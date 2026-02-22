import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { store } from '@/store';
import Header from '@/components/layout/Header';
import HomePage from '@/pages/HomePage';
import DataRoomPage from '@/pages/DataRoomPage';


/** Scroll to top on route change and on initial page load / refresh */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />
        <TooltipProvider delayDuration={300}>
          <div className="min-h-screen noise">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dataroom/:id" element={<DataRoomPage />} />
            </Routes>
          </div>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111118',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
                boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
              },
            }}
          />
        </TooltipProvider>
      </BrowserRouter>
    </Provider>
  );
}
