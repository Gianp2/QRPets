import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import PetFormPage from "./pages/PetFormPage";
import PetPublicProfile from "./pages/PetPublicProfile";
import PetPrivatePage from "./pages/PetPrivatePage";
import AdminDashboard from "./pages/AdminDashboard";
import { motion, AnimatePresence } from "motion/react";
import { Check, AlertCircle, Info, QrCode, X } from "lucide-react";

// Secure Private Route Guard
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useApp();
  
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

// Global Toast Notifications Container Component
function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl text-xs leading-relaxed font-sans ${
              toast.type === "success" ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950 dark:text-emerald-50" :
              toast.type === "error" ? "border-red-200/80 bg-red-50/90 text-red-950 dark:border-red-900/60 dark:bg-red-950 dark:text-red-50" :
              toast.type === "scan" ? "border-indigo-500/30 bg-indigo-950 text-white shadow-indigo-500/10" :
              "border-slate-200/80 bg-white/95 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
            }`}
          >
            <div className={`p-1 rounded-lg shrink-0 ${
              toast.type === "success" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300" :
              toast.type === "error" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" :
              toast.type === "scan" ? "bg-indigo-600 text-white animate-bounce" :
              "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}>
              {toast.type === "success" && <Check className="h-4 w-4" />}
              {toast.type === "error" && <AlertCircle className="h-4 w-4" />}
              {toast.type === "scan" && <QrCode className="h-4 w-4" />}
              {toast.type === "info" && <Info className="h-4 w-4" />}
            </div>

            <div className="flex-1">
              <span className={`font-semibold block mb-0.5 ${
                toast.type === "scan" ? "text-white" : "text-slate-900 dark:text-white"
              }`}>
                {toast.type === "scan" ? "🔔 ¡QR Escaneado!" : "PetLink QR"}
              </span>
              <p className={`text-xs ${
                toast.type === "success" ? "text-emerald-800 dark:text-emerald-200" :
                toast.type === "error" ? "text-red-800 dark:text-red-200" :
                toast.type === "scan" ? "text-indigo-200" :
                "text-slate-800 dark:text-slate-200"
              }`}>{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className={`shrink-0 p-0.5 rounded-lg transition ${
                toast.type === "scan" 
                  ? "text-indigo-300 hover:text-white hover:bg-indigo-800/50" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800/50"
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function MainAppLayout() {
  const { user } = useApp();
  const location = useLocation();

  // Don't show developer sandbox on the public profile screen to maximize realism for scanned views
  const isPublicProfile = location.pathname.startsWith("/pet/") && !location.pathname.startsWith("/pet/manage/") && !location.pathname.startsWith("/pet/edit/");

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/register" element={<AuthPage initialMode="register" />} />
        <Route path="/reset-password" element={<AuthPage initialMode="recover" />} />
        <Route path="/pet/:id" element={<PetPublicProfile />} />

        {/* Private User Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/pet/add"
          element={
            <PrivateRoute>
              <PetFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/pet/edit/:id"
          element={
            <PrivateRoute>
              <PetFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/pet/manage/:id"
          element={
            <PrivateRoute>
              <PetPrivatePage />
            </PrivateRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Catch All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global animated alert displays */}
      <ToastContainer />

    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainAppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
