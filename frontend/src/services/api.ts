import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 instead of localhost
// Update the port if your backend runs on a different port
export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8080/chatconnect' 
  : 'http://localhost:8080/chatconnect';

export const WS_BASE_URL = Platform.OS === 'android'
  ? 'ws://10.0.2.2:8080/chatconnect'
  : 'ws://localhost:8080/chatconnect';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
