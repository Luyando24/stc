import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(pb.authStore.model);
    setIsAuthenticated(pb.authStore.isValid);
    setLoading(false);

    const unsubscribe = pb.authStore.onChange(() => {
      setCurrentUser(pb.authStore.model);
      setIsAuthenticated(pb.authStore.isValid);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
      setCurrentUser(authData.record);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, passwordConfirm, name, company_name, phone) => {
    try {
      const data = {
        email,
        password,
        passwordConfirm,
        name,
        company_name,
        phone,
        emailVisibility: true
      };
      
      await pb.collection('users').create(data, { $autoCancel: false });
      
      const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
      setCurrentUser(authData.record);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};