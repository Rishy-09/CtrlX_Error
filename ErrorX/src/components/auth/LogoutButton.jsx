import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

export default function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleLogout}
      className="text-sm font-medium text-gray-500 hover:text-gray-700"
    >
      Logout
    </motion.button>
  );
}