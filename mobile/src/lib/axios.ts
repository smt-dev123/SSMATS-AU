import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const envURL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
const baseURL = envURL || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptors for tokens
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("sessionToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log("Error loading token in axios", error);
  }
  return config;
});

export default api;
