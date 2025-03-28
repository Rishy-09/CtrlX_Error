import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Close modal on Escape key press
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle search input change
  const handleSearch = (value) => {
    setQuery(value);
    setIsLoading(true);

    // Simulate a search with a timeout (replace with actual search logic)
    setTimeout(() => {
      setResults([
        { id: 1, type: 'bug', title: 'Login issue' },
        { id: 2, type: 'project', title: 'E-commerce Platform' },
      ]);
      setIsLoading(false);
    }, 500); // Simulate a delay
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
        >
          <div className="p-4">
            <input
              type="text"
              placeholder="Search bugs, projects, or users... (Press Esc to close)"
              className="w-full px-4 py-2 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="border-t max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-gray-500">Searching...</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-gray-500">No results found.</div>
            ) : (
              results.map((result) => (
                <div
                  key={result.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => {
                    navigate(`/${result.type}s/${result.id}`);
                    onClose();
                  }}
                >
                  <span className="text-sm text-gray-500 w-20">{result.type}</span>
                  <span className="flex-1">{result.title}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
