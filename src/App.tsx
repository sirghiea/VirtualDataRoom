import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { store } from '@/store';
import Header from '@/components/layout/Header';
import HomePage from '@/pages/HomePage';
import DataRoomPage from '@/pages/DataRoomPage';
import CommandPalette from '@/components/layout/CommandPalette';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <TooltipProvider delayDuration={300}>
          <div className="min-h-screen">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dataroom/:id" element={<DataRoomPage />} />
            </Routes>
          </div>
          <CommandPalette />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1e1e2e',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
              },
            }}
          />
        </TooltipProvider>
      </BrowserRouter>
    </Provider>
  );
}
