import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notification) => 
        set((state) => ({
          notifications: [{
            id: Date.now(),
            read: false,
            timestamp: new Date().toISOString(),
            ...notification
          }, ...state.notifications]
        })),
      markAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'notifications-storage',
    }
  )
);

export default useNotificationStore;