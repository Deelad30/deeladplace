import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { 
  login as apiLogin, 
  register as apiSignup, 
  me as getCurrentUser 
} from "../api/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  /** -------------------------------
   * Apply token to axios globally
   --------------------------------*/
  const applyToken = (t) => {
    if (t) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    if (token) applyToken(token);
  }, [token]);

  /** -------------------------------
   * Global Axios Interceptor
   * Auto-logout inactive or invalid users
   --------------------------------*/
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const msg = error.response?.data?.error;

        // ⛔ ACCOUNT DEACTIVATED
        if (status === 403 && msg === "Your account has been deactivated") {
          logout();
        }

        // ⛔ TOKEN EXPIRED / INVALID
        if (status === 401) {
          logout();
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  /** -------------------------------
   * On initial load: fetch current user
   --------------------------------*/
  useEffect(() => {
    async function init() {
      if (token && !user) {
        try {
          const res = await getCurrentUser(); // /auth/me
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (error) {
          logout();
        }
      }

      setLoading(false);
    }
    init();
  }, []); // eslint-disable-line

  /** -------------------------------
   * LOGIN
   --------------------------------*/
  const login = async (email, password) => {
    try {
      const response = await apiLogin({ email, password });
      const data = response.data;

      if (!data.token) {
        return { success: false, message: "No token returned from server" };
      }

      // Save token
      localStorage.setItem("token", data.token);
      setToken(data.token);
      applyToken(data.token);

      // Save user
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Login failed",
      };
    }
  };

  /** -------------------------------
   * SIGNUP
   --------------------------------*/
  const signup = async (name, businessName, email, password) => {
    try {
      await apiSignup({
        name,
        tenantName: businessName, 
        email,
        password,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Registration failed",
      };
    }
  };

  /** -------------------------------
   * LOGOUT
   --------------------------------*/
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    applyToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, loading }}
    >
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
