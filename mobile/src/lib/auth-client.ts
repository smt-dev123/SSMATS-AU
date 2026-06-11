import { createAuthClient } from "better-auth/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const envURL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
const apiURL = (envURL || "http://localhost:3000/api").replace(/\/+$/, "");
const baseURL = `${apiURL}/auth`;

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    customFetchImpl: async (url, init) => {
      try {
        init = init || {};
        init.headers = new Headers(init.headers);

        // Add Origin to bypass CSRF check on mobile (better-auth requirement)
        if (!init.headers.has("Origin")) {
          init.headers.set("Origin", "http://localhost:8081");
        }

        const token = await AsyncStorage.getItem("sessionToken");
        if (token) {
          init.headers.set("Authorization", `Bearer ${token}`);
        }
      } catch {}
      return fetch(url, init);
    },
  },
});

export const { signIn, signUp, useSession, signOut } = authClient;
