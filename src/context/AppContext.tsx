import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Pet, Notification, DevEmail } from "../types";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "scan";
  duration?: number;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  pets: Pet[];
  notifications: Notification[];
  unreadCount: number;
  devEmails: DevEmail[];
  toasts: ToastMessage[];
  isInitialized: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  fetchPets: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchDevEmails: () => Promise<void>;
  addToast: (message: string, type: "success" | "error" | "info" | "scan") => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [devEmails, setDevEmails] = useState<DevEmail[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("petlink_dark_mode");
    if (saved !== null) {
      return saved === "true";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("petlink_dark_mode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Helper for showing animated toast
  const addToast = (message: string, type: "success" | "error" | "info" | "scan") => {
    const id = "toast-" + Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth initialization
  useEffect(() => {
    const storedToken = localStorage.getItem("petlink_token");
    const storedUser = localStorage.getItem("petlink_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("petlink_token");
        localStorage.removeItem("petlink_user");
      }
    }
    setIsInitialized(true);
  }, []);

  // Fetch initial user data once authenticated
  useEffect(() => {
    if (token && user) {
      fetchPets();
      fetchNotifications();
      fetchDevEmails();
    } else {
      setPets([]);
      setNotifications([]);
    }
  }, [token, user?.id]);

  // SSE subscription for live scan events
  useEffect(() => {
    if (!token) return;

    const sseUrl = `/api/notifications/sse?token=${encodeURIComponent(token)}`;
    let eventSource: EventSource | null = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const newNotif = JSON.parse(event.data) as Notification;
        
        // Add to notification list
        setNotifications((prev) => [newNotif, ...prev]);
        
        // Show high-priority scan alert toast
        addToast(newNotif.title + ": " + newNotif.message, "scan");

        // Refresh pets list to update scan counts
        fetchPets();
      } catch (e) {
        // Ignored
      }
    };

    eventSource.onerror = () => {
      // Auto-reconnect happens natively, but let's handle cleanup
      if (eventSource) {
        eventSource.close();
      }
    };

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [token]);

  // Dev tools mailbox poller
  useEffect(() => {
    fetchDevEmails();
    const interval = setInterval(() => {
      fetchDevEmails();
    }, 4000); // Poll emails every 4 seconds to display in real-time
    return () => clearInterval(interval);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("petlink_token", newToken);
    localStorage.setItem("petlink_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    addToast(`¡Bienvenido de nuevo, ${newUser.name}!`, "success");
  };

  const logout = () => {
    localStorage.removeItem("petlink_token");
    localStorage.removeItem("petlink_user");
    setToken(null);
    setUser(null);
    setPets([]);
    setNotifications([]);
    addToast("Sesión cerrada correctamente", "info");
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("petlink_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const fetchPets = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPets(data);
      }
    } catch (err) {
      console.error("Error fetching pets", err);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const fetchDevEmails = async () => {
    try {
      const res = await fetch("/api/dev/emails");
      if (res.ok) {
        const data = await res.json();
        setDevEmails(data);
      }
    } catch (err) {
      console.error("Error fetching dev emails", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        pets,
        notifications,
        unreadCount,
        devEmails,
        toasts,
        isInitialized,
        darkMode,
        toggleDarkMode,
        login,
        logout,
        updateUser,
        fetchPets,
        fetchNotifications,
        fetchDevEmails,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
