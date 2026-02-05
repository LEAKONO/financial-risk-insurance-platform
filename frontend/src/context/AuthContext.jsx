// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService, userService } from '../services/api';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('⚠️ No token found, user not authenticated');
        setLoading(false);
        return;
      }

      console.log('🔄 Loading user profile...');
      const response = await userService.getProfile();
      
      // Handle different response structures
      let userData = null;
      
      if (response.success && response.data) {
        // Check if response.data is the user object directly
        if (response.data._id || response.data.email) {
          userData = response.data;
        }
        // Or if it's wrapped in a data property
        else if (response.data.data && (response.data.data._id || response.data.data.email)) {
          userData = response.data.data;
        }
        // Or if it's in a user property
        else if (response.data.user) {
          userData = response.data.user;
        }
      }
      
      if (userData) {
        console.log('✅ User profile loaded:', userData);
        console.log('🎭 User role:', userData?.role);
        setUser(userData);
      } else {
        console.log('❌ Failed to load user profile');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    } catch (err) {
      console.error('❌ Failed to load user:', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('🔐 Attempting login for:', email);
      
      const response = await authService.login({ email, password });
      
      console.log('📥 Login response:', response);
      
      if (response.success && response.data) {
        let userData = null;
        let tokens = null;
        
        // Handle backend response structure: { success, message, data: { user, tokens } }
        if (response.data.user && response.data.tokens) {
          userData = response.data.user;
          tokens = response.data.tokens;
        }
        // Alternative structure
        else if (response.data.data?.user && response.data.data?.tokens) {
          userData = response.data.data.user;
          tokens = response.data.data.tokens;
        }
        else if (response.data) {
          userData = response.data;
          tokens = { accessToken: response.data.accessToken };
        }
        
        if (userData && tokens?.accessToken) {
          console.log('✅ Login successful!');
          console.log('👤 User data:', userData);
          console.log('🎭 User role:', userData?.role);
          
          // Store tokens
          localStorage.setItem('accessToken', tokens.accessToken);
          if (tokens.refreshToken) {
            localStorage.setItem('refreshToken', tokens.refreshToken);
          }
          
          // Set user state
          setUser(userData);
          
          return { success: true, user: userData };
        } else {
          console.log('❌ Could not extract user or tokens from response');
          return { success: false, error: 'Invalid response from server' };
        }
      } else {
        return { 
          success: false, 
          error: response.message || 'Login failed' 
        };
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('📝 Registration attempt:', userData);
      
      // Clean data before sending
      const cleanData = {
        email: userData.email?.toLowerCase().trim(),
        password: userData.password,
        firstName: userData.firstName?.trim(),
        lastName: userData.lastName?.trim(),
        phone: userData.phone?.trim(),
        dateOfBirth: userData.dateOfBirth // Should be YYYY-MM-DD
      };
      
      console.log('📤 Sending cleaned data:', cleanData);
      
      const response = await authService.register(cleanData);
      
      console.log('📥 Registration response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Registration API success');
        
        let userData = null;
        let tokens = null;
        
        // Handle response structure
        if (response.data.user && response.data.tokens) {
          userData = response.data.user;
          tokens = response.data.tokens;
        } else if (response.data.data?.user && response.data.data?.tokens) {
          userData = response.data.data.user;
          tokens = response.data.data.tokens;
        } else if (response.data) {
          userData = response.data.user || response.data;
          tokens = response.data.tokens || { accessToken: response.data.accessToken };
        }
        
        if (userData) {
          console.log('✅ Registration successful! User:', userData);
          
          // Store tokens
          if (tokens?.accessToken) {
            localStorage.setItem('accessToken', tokens.accessToken);
            console.log('✅ Access token stored');
          }
          if (tokens?.refreshToken) {
            localStorage.setItem('refreshToken', tokens.refreshToken);
          }
          
          // Set user in state
          console.log('👤 Setting user in context:', userData);
          setUser(userData);
          
          return { success: true, user: userData };
        } else {
          console.log('❌ No user data in response');
          return { success: false, error: 'No user data received' };
        }
      } else {
        console.log('❌ Registration failed:', response);
        return { 
          success: false, 
          error: response.message || 'Registration failed' 
        };
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // Extract error message
      let errorMessage = 'Registration failed';
      const errorData = err.response?.data;
      
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.errors) {
        // Handle validation errors
        errorMessage = Object.values(errorData.errors).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await authService.logout();
    } catch (err) {
      console.error('❌ Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      console.log('✅ Logged out successfully');
    }
  };

  const updateProfile = async (data) => {
    try {
      console.log('🔄 Updating profile...');
      const response = await userService.updateProfile(data);
      
      if (response.success && response.data) {
        let updatedUser = null;
        
        if (response.data._id || response.data.email) {
          updatedUser = response.data;
        } else if (response.data.data) {
          updatedUser = response.data.data;
        } else if (response.data.user) {
          updatedUser = response.data.user;
        }
        
        if (updatedUser) {
          console.log('✅ Profile updated:', updatedUser);
          setUser(updatedUser);
          return { success: true, user: updatedUser };
        }
      }
      
      return { success: false, error: 'Update failed' };
    } catch (err) {
      console.error('❌ Profile update error:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    loadUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  useEffect(() => {
    if (user || loading === false) {
      console.log('🔄 Auth State Changed:');
      console.log('  - User:', user);
      console.log('  - Is Authenticated:', !!user);
      console.log('  - Is Admin:', user?.role === 'admin');
      console.log('  - Loading:', loading);
    }
  }, [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};