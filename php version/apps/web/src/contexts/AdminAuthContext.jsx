import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isSuperAdmin = currentAdmin?.email === 'sales@stc-logistics.com';

  useEffect(() => {
    // Check initial auth state
    if (pb.authStore.isValid && pb.authStore.model?.collectionName === 'admins') {
      setCurrentAdmin(pb.authStore.model);
    } else {
      setCurrentAdmin(null);
    }
    
    setIsLoading(false);

    // Listen for auth store changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (model?.collectionName === 'admins') {
        setCurrentAdmin(model);
      } else {
        setCurrentAdmin(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      if (!pb) throw new Error('Database connection issue: PocketBase client missing.');
      if (!email || !password) throw new Error('Email and password are required.');

      // Authenticate using PocketBase native email/password auth
      const authData = await pb.collection('admins').authWithPassword(email, password, {
        $autoCancel: false
      });

      const adminRecord = authData.record;

      // Optional: Check if account is active (excluding super admin)
      if (adminRecord.email !== 'sales@stc-logistics.com' && adminRecord.status !== 'active' && adminRecord.status) {
        pb.authStore.clear();
        setCurrentAdmin(null);
        throw new Error('Your account is not active. Please contact support.');
      }

      setCurrentAdmin(adminRecord);
      return { success: true, record: adminRecord };
      
    } catch (error) {
      console.error('Login error:', error);
      // Provide user-friendly error messages based on PocketBase errors
      if (error.status === 400 || error.response?.code === 400) {
        throw new Error('Invalid email or password.');
      }
      throw new Error(error.message || 'Authentication failed. Please try again.');
    }
  };

  const signup = async (email, password, fullName, phone, department) => {
    try {
      if (!pb) throw new Error('Database connection issue: PocketBase client missing.');

      const isSuperAdminAccount = email.toLowerCase() === 'sales@stc-logistics.com';
      
      const payload = {
        email,
        password,
        passwordConfirm: password, // As requested, using password for confirmation in PB payload
        fullName,
        phone,
        department,
        status: isSuperAdminAccount ? 'active' : 'pending',
        emailVisibility: true
      };

      const record = await pb.collection('admins').create(payload, {
        $autoCancel: false
      });

      // Auto login after successful signup
      await login(email, password);

      return { success: true, record };
    } catch (error) {
      console.error('Signup error:', error);
      if (error.status === 400 || error.response?.code === 400) {
        const errorData = error.response?.data || {};
        let messages = [];
        if (errorData.email) messages.push(`Email: ${errorData.email.message}`);
        if (errorData.password) messages.push(`Password: ${errorData.password.message}`);
        
        throw new Error(messages.length > 0 ? messages.join(' | ') : 'Validation failed. Email might already be in use.');
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentAdmin(null);
  };

  const value = {
    currentAdmin,
    isSuperAdmin,
    isLoading,
    login,
    signup,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!isLoading && children}
    </AdminAuthContext.Provider>
  );
};