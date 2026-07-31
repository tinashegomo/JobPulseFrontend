import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { useForegroundMessages } from './hooks/useForegroundMessages';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Toast from './components/shared/Toast';
import ErrorToast from './components/shared/ErrorToast';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import Resume from './pages/Resume';
import Login from './pages/Login';
import Register from './pages/Register';

const queryClient = new QueryClient();

const App = () => {
  const { messages, dismiss } = useForegroundMessages();

  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/resume" element={<Resume />} />
            </Route>
          </Route>
        </Routes>

        {messages.map((msg, i) => (
          <Toast
            key={msg.receivedAt}
            title={msg.title}
            body={msg.body}
            url={msg.url}
            onClose={() => dismiss(i)}
          />
        ))}
        <ErrorToast />
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
