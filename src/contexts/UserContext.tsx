import React, { createContext, useContext, useState, useEffect } from 'react';

export type Profile = 'Parent' | 'Addy' | 'Della' | 'Cash' | 'Ellie';

interface UserContextType {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('activeProfile') as Profile | null;
    if (stored) {
      setActiveProfileState(stored);
    }
    setIsLoaded(true);
  }, []);

  const setActiveProfile = (profile: Profile | null) => {
    setActiveProfileState(profile);
    if (profile) {
      localStorage.setItem('activeProfile', profile);
    } else {
      localStorage.removeItem('activeProfile');
    }
  };

  if (!isLoaded) return null;

  return (
    <UserContext.Provider value={{ activeProfile, setActiveProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
