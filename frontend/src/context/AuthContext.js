import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { 
  login as apiLogin, 
  register as apiSignup, 
  me as getCurrentUser 
} from '../api/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Apply token to axios globally
  const applyToken = (t) => {
    if (t) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Apply token to axios when loaded from storage
  useEffect(() => {
    if (token) applyToken(token);
  }, [token]);

  // On initial load, fetch fresh user if token exists but user isn't stored
  useEffect(() => {
    async function init() {
      if (token && !user) {
        try {
          const res = await getCurrentUser(); // /auth/me
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (error) {
          logout();
        }
      }

      setLoading(false);
    }
    init();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LOGIN
  const login = async (email, password) => {
    try {
      const response = await apiLogin({ email, password });
      const data = response.data;

      if (!data.token) {
        return { success: false, message: "No token returned from server" };
      }

      // save token
      localStorage.setItem('token', data.token);
      setToken(data.token);
      applyToken(data.token);

      // user is expected in data.user
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // SIGNUP
const signup = async (name, businessName, email, password) => {
  try {
    await apiSignup({
      name,
      tenantName: businessName,   // ✅ THIS is what the backend expects
      email,
      password
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  }
};


  // LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    applyToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { authService } from '../services/authService';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const userData = localStorage.getItem('user');

//     if (token && userData) {
//       setUser(JSON.parse(userData));
//       authService.setToken(token);
//     }
//     setLoading(false);
//   }, []);

// const login = async (email, password) => {
//   try {
//     // 1. Login and receive token
//     const response = await authService.login(email, password);
//     const { token } = response.data;

//     // 2. Store token and set axios header
//     localStorage.setItem('token', token);
//     authService.setToken(token);

//     // 3. Fetch the latest user from your database
//     const profileRes = await authService.getCurrentUser();
//     console.log(profileRes);
    
//     const updatedUser = profileRes.data;

//     // 4. Save updated user to state + localStorage
//     setUser(updatedUser);
//     localStorage.setItem('user', JSON.stringify(updatedUser));

//     return { success: true };
//   } catch (error) {
//     return {
//       success: false,
//       message: error.message || "Login failed",
//     };
//   }
// };


//   const signup = async (name, email, password) => {
//     try {
//       const response = await authService.register(name, email, password);      
//       return { success: true };
//     } catch (error) {
//       return { 
//         success: false, 
//         message: error.response?.data?.message || 'Registration failed' 
//       };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     authService.setToken(null);
//     setUser(null);
//   };

//   const value = {
//     user,
//     login,
//     signup, // Make sure this is included
//     logout,
//     loading
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

