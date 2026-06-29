import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetch } from "../mockApi";
import { QrCode, Lock, Mail, User, AlertCircle, CheckCircle, ArrowLeft, Loader2, ShieldAlert, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

export default function AuthPage({ initialMode = "login" }: { initialMode?: "login" | "register" | "recover" }) {
  const { login, addToast, user, darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<"login" | "register" | "recover" | "reset">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Detect reset token in query params
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setResetToken(token);
      setMode("reset");
    } else {
      setMode(initialMode);
    }
  }, [searchParams, initialMode]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (mode === "register") {
        if (!name || !email || !password) {
          setErrorMsg("Todos los campos son obligatorios.");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (res.ok) {
          login(data.token, data.user);
          addToast("¡Registro exitoso!", "success");
          navigate("/dashboard");
        } else {
          setErrorMsg(data.error || "Ocurrió un error al registrarse.");
        }
      } else if (mode === "login") {
        if (!email || !password) {
          setErrorMsg("Correo y contraseña son requeridos.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (res.ok) {
          login(data.token, data.user);
          navigate("/dashboard");
        } else {
          setErrorMsg(data.error || "Credenciales incorrectas.");
        }
      } else if (mode === "recover") {
        if (!email) {
          setErrorMsg("Por favor, introduce tu correo electrónico.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/auth/recover-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (res.ok) {
          setSuccessMsg(data.message || "Enlace enviado. Por favor revisa tu bandeja de entrada o el Panel de Desarrollo.");
          addToast("Correo de recuperación enviado", "info");
        } else {
          setErrorMsg(data.error || "Error al procesar la solicitud.");
        }
      } else if (mode === "reset") {
        if (!password || !confirmPassword) {
          setErrorMsg("Por favor, llena ambos campos de contraseña.");
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMsg("Las contraseñas no coinciden.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: resetToken, newPassword: password }),
        });

        const data = await res.json();
        if (res.ok) {
          setSuccessMsg("¡Contraseña reestablecida correctamente! Ya puedes iniciar sesión.");
          addToast("Contraseña actualizada con éxito", "success");
          setTimeout(() => {
            setMode("login");
            setSuccessMsg("");
            setPassword("");
            setConfirmPassword("");
          }, 3000);
        } else {
          setErrorMsg(data.error || "El token es inválido o expiró.");
        }
      }
    } catch (err) {
      setErrorMsg("Error de conexión. Intente más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 font-sans relative overflow-hidden transition-colors text-slate-800 dark:text-slate-100">
      {/* Button to go back to landing page */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition bg-white dark:bg-slate-900 py-2 px-4 rounded-xl border border-slate-200/80 dark:border-slate-850 shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Top right dark mode toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 shadow-xs transition"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Background blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl relative z-10 transition-colors"
      >
        {/* Brand header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-2 mb-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm group-hover:scale-105 transition">
              <QrCode className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              PetLink<span className="text-indigo-600">QR</span>
            </span>
          </Link>

          <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-white mt-2">
            {mode === "login" && "Bienvenido de nuevo"}
            {mode === "register" && "Crea tu cuenta gratuita"}
            {mode === "recover" && "Recuperar contraseña"}
            {mode === "reset" && "Establecer nueva contraseña"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mode === "login" && "Ingresa tus credenciales para administrar tus mascotas"}
            {mode === "register" && "Comienza a proteger a tus mascotas hoy mismo"}
            {mode === "recover" && "Te enviaremos un enlace de restauración a tu correo"}
            {mode === "reset" && "Escribe tu nueva contraseña de acceso"}
          </p>
        </div>

        {/* Action Notifications */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre Completo</label>
              <div className="relative">
                <User className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Carlos Sánchez"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 focus:bg-white dark:focus:bg-slate-900 transition animate-none"
                />
              </div>
            </div>
          )}

          {(mode === "login" || mode === "register" || mode === "recover") && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute top-3.5 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 focus:bg-white dark:focus:bg-slate-900 transition animate-none"
                />
              </div>
            </div>
          )}

          {(mode === "login" || mode === "register" || mode === "reset") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contraseña</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("recover")}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    ¿La olvidaste?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute top-3.5 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "reset" ? "Nueva contraseña" : "••••••••"}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 focus:bg-white dark:focus:bg-slate-900 transition animate-none"
                />
              </div>
            </div>
          )}

          {mode === "reset" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute top-3.5 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir nueva contraseña"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 focus:bg-white dark:focus:bg-slate-900 transition animate-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-display font-semibold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Procesando...
              </>
            ) : (
              <>
                {mode === "login" && "Iniciar Sesión"}
                {mode === "register" && "Registrarse"}
                {mode === "recover" && "Enviar Enlace"}
                {mode === "reset" && "Actualizar Contraseña"}
              </>
            )}
          </button>
        </form>

        {/* Footer toggles */}
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === "login" && (
            <p>
              ¿No tienes una cuenta?{" "}
              <button onClick={() => setMode("register")} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Registrate gratis
              </button>
            </p>
          )}

          {mode === "register" && (
            <p>
              ¿Ya tienes una cuenta?{" "}
              <button onClick={() => setMode("login")} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Inicia sesión
              </button>
            </p>
          )}

          {(mode === "recover" || mode === "reset") && (
            <button
              onClick={() => setMode("login")}
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" /> Volver al Inicio de Sesión
            </button>
          )}

          {(mode === "login" || mode === "register") && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <Link to="/" className="inline-flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition hover:underline">
                <ArrowLeft className="h-3 w-3" /> Volver a la página principal
              </Link>
            </div>
          )}
        </div>

        {/* Sandbox alert */}
        <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 p-4 text-center transition-colors">
          <div className="flex justify-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold">
            <ShieldAlert className="h-4 w-4 shrink-0 animate-pulse" />
            <span>MODO SIMULADOR DE DESARROLLO ACTIVO</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            Puedes registrarte de forma gratuita con cualquier cuenta, o usar los accesos de prueba autocompletables:
          </p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => {
                setEmail("demo@petlinkqr.com");
                setPassword("demo123");
                setMode("login");
              }}
              className="flex-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 py-2 px-3 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              👤 Autocompletar Demo (Usuario)
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@petlinkqr.com");
                setPassword("admin123");
                setMode("login");
              }}
              className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 py-2 px-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              ⚙️ Autocompletar Admin
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
