import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/lib/axios";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "@/api/NotificationAPI";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  priority?: "low" | "normal" | "high";
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  fetchNotifications: () => Promise<void>;
  onRefresh: () => void;
  handleMarkAsRead: (id: number) => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      const mapped = data.map((item: any) => ({
        id: item.id,
        title: item.notification.title,
        message: item.notification.message,
        createdAt: item.notification.createdAt,
        isRead: item.isRead,
        priority: item.notification.priority,
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    let ws: WebSocket | null = null;
    let active = true;

    const connectWS = async () => {
      try {
        const token = await AsyncStorage.getItem("sessionToken");
        if (!token) return;

        const baseURL = api.defaults.baseURL || "http://localhost:3000/api";
        const wsUrl =
          baseURL.replace(/^http/, "ws") + `/notifications/ws?token=${token}`;

        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          if (!active) return;
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === "NEW_NOTIFICATION") {
              fetchNotifications();
            }
          } catch (e) {
            console.error("WS parse error", e);
          }
        };

        ws.onerror = (e) => {
          console.error("WS error", e);
        };
      } catch (e) {
        console.error("Failed to connect WS", e);
      }
    };

    connectWS();

    return () => {
      active = false;
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    for (const n of unread) {
      await handleMarkAsRead(n.id);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshing,
        fetchNotifications,
        onRefresh,
        handleMarkAsRead,
        handleMarkAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
