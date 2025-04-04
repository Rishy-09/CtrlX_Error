import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'light',
      emailNotifications: true,
      pushNotifications: false,
      language: 'en',
      profile: {
        firstName: '',
        lastName: '',
        email: '',
        avatar: '',
      },
      setTheme: (theme) => set({ theme }),
      setNotificationPreference: (type, value) => 
        set((state) => ({ [type]: value })),
      setLanguage: (language) => set({ language }),
      updateProfile: (profile) => 
        set((state) => ({ profile: { ...state.profile, ...profile } })),
    }),
    {
      name: 'settings-storage',
    }
  )
);

export default useSettingsStore;