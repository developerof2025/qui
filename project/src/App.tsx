import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { RoleSelection } from './components/RoleSelection';
import { AdminPanel } from './components/AdminPanel';
import { UserPanel } from './components/UserPanel';
import { User, AuthState } from './types/auth';
import { apiService } from './services/api';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      apiService.setToken(token);
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        token: localStorage.getItem('token')
      });
    } catch (error) {
      console.error('Failed to get current user:', error);
      apiService.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (name: string, email: string, password: string, isLogin: boolean) => {
    try {
      let response;
      if (isLogin) {
        response = await apiService.login(email, password);
      } else {
        response = await apiService.register(name, email, password);
      }

      // For new registrations, show role selection
      if (!isLogin) {
        setShowRoleSelection(true);
        setAuthState({
          isAuthenticated: false,
          user: response.user,
          token: response.token
        });
      } else {
        // For login, user already has a role
        setAuthState({
          isAuthenticated: true,
          user: response.user,
          token: response.token
        });
      }
    } catch (error: any) {
      alert(error.message || 'Authentication failed');
    }
  };

  const handleRoleSelect = async (role: 'admin' | 'user') => {
    try {
      const response = await apiService.updateRole(role);
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        token: authState.token
      });
      setShowRoleSelection(false);
    } catch (error: any) {
      alert(error.message || 'Failed to update role');
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
    setShowRoleSelection(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication form if not authenticated
  if (!authState.isAuthenticated && !showRoleSelection) {
    return <AuthForm onAuth={handleAuth} />;
  }

  // Show role selection for new users
  if (showRoleSelection && authState.user) {
    return (
      <RoleSelection 
        onRoleSelect={handleRoleSelect} 
        userName={authState.user.name}
      />
    );
  }

  // Show appropriate panel based on user role
  if (authState.user?.role === 'admin') {
    return (
      <AdminPanel
        onLogout={handleLogout}
        userName={authState.user.name}
      />
    );
  }

  return (
    <UserPanel
      onLogout={handleLogout}
      userName={authState.user?.name || ''}
    />
  );
}

export default App;