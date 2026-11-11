import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HomePage } from './pages/HomePage';
import './styles.css';

const client = new QueryClient();
export function App() { return <QueryClientProvider client={client}><HomePage /><Toaster position="top-right" toastOptions={{ duration: 4000 }} /></QueryClientProvider>; }
