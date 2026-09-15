import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  userToken: string | null;
  userId: number | null;
  isLoading: boolean;
  signIn: (token: string, id: number) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  userId: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token;
      let id;
      try {
        token = await AsyncStorage.getItem('userToken');
        const idStr = await AsyncStorage.getItem('userId');
        id = idStr ? parseInt(idStr, 10) : null;
      } catch (e) {
        // Restoring token failed
      }
      setUserToken(token || null);
      setUserId(id || null);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const signIn = async (token: string, id: number) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', id.toString());
      setUserToken(token);
      setUserId(id);
    } catch (e) {
      console.error(e);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userId');
      setUserToken(null);
      setUserId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, userId, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
