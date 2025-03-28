import { BrowserRouter as Router } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import AppRoutes from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AnimatePresence mode="wait">
          <AppRoutes 
            isAuthenticated={isAuthenticated} 
            setIsAuthenticated={setIsAuthenticated} 
          />
        </AnimatePresence>
      </Router>
    </QueryClientProvider>
  );
}

export default App;