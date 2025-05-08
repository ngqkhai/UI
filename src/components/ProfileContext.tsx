'use client'
import React, { createContext, useContext, useState, useEffect } from "react";

export type UserProfile = {
  username?: string;
  email?: string;
  createdAt?: string;
  [key: string]: any;
};

interface ProfileContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  setProfile: () => {},
});

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);

  // Save to localStorage when profile changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem("userProfile", JSON.stringify(profile));
    }
  }, [profile]);

  // Load from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("userProfile");
    if (cached) {
      setProfileState(JSON.parse(cached));
    }
  }, []);

  // Wrap setProfile to update state and localStorage
  const setProfile = (profile: UserProfile | null) => {
    setProfileState(profile);
    if (profile) {
      localStorage.setItem("userProfile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("userProfile");
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext); 