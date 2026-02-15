import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import HomePage from '@/pages/HomePage';
import DataRoomPage from '@/pages/DataRoomPage';
import Toast from '@/components/shared/Toast';

function AppContent() {
  const { state, clearError } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dataroom/:id" element={<DataRoomPage />} />
      </Routes>
      {state.error && (
        <Toast message={state.error} type="error" onClose={clearError} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
