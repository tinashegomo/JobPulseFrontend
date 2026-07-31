import { createContext, useState, useEffect, useContext } from "react";
import { getStoredToken, saveToken, removeToken, isTokenExpired } from "../utils/tokenUtils";
import { loginUser as apiLogin, registerUser as apiRegister, getCurrentUser } from "../api/JobPulseAPI";

export const AuthContext = createContext(null);

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token && !isTokenExpired(token)) {
      getCurrentUser()
        .then((user) => {
          setCurrentUser({ ...user, token });
        })
        .catch(() => {
          removeToken();
          setCurrentUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      removeToken();
      setCurrentUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await apiLogin({ email, password });
    saveToken(response.token);
    setCurrentUser({ id: response.id, email: response.email, token: response.token });
    return response;
  };

  const register = async (email, password, fullName) => {
    const response = await apiRegister({ email, password, fullName });
    saveToken(response.token);
    setCurrentUser({ id: response.id, email: response.email, token: response.token });
    return response;
  };

  const logout = () => {
    removeToken();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
