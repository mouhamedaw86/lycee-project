import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SetupScreen } from '@/components/SetupScreen';
import { isSupabaseConfigured } from '@/lib/supabase';
import './index.css';
import './theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>{isSupabaseConfigured ? <App /> : <SetupScreen />}</ErrorBoundary>
  </StrictMode>
);
