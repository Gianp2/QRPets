import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { fetch } from "../mockApi";
import {
  Plus,
  QrCode,
  Edit,
  Eye,
  Trash2,
  Download,
  Printer,
  User as UserIcon,
  Shield,
  Bell,
  CheckCircle,
  Clock,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Settings,
  Lock,
  X,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function DashboardPage() {
  const {
    user,
    token,
    pets,
    notifications,
    unreadCount,
    logout,
    fetchPets,
    fetchNotifications,
    addToast,
    updateUser,
    darkMode,
    toggleDarkMode
  } = useApp();
  
  const navigate = useNavigate();

  // Active sub-tabs
  const [activeTab, setActiveTab] = useState<"pets" | "notifications" | "settings">("pets");

  const handleTabChange = (tab: "pets" | "notifications" | "settings") => {
    setActiveTab(tab);
    // Smooth scroll to content on mobile screens
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const contentEl = document.getElementById("tab-content-area");
        if (contentEl) {
          contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  };

  // Profile Edit fields
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhoto, setEditPhoto] = useState(user?.photoUrl || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Delete Pet Confirmation Dialog
  const [petToDelete, setPetToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Print QR Modal
  const [qrToPrint, setQrToPrint] = useState<{ id: string; name: string; codeId: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) {
      addToast("El nombre es requerido", "error");
      return;
    }
    setIsUpdatingProfile(true);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName, photoUrl: editPhoto })
      });

      const data = await res.json();
      if (res.ok) {
        updateUser(data);
        addToast("Perfil actualizado correctamente", "success");
      } else {
        addToast(data.error || "Error al actualizar perfil", "error");
      }
    } catch (err) {
      addToast("Error de conexión", "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast("Todos los campos son obligatorios", "error");
      return;
    }
    if (newPassword.length < 6) {
      addToast("La nueva contraseña debe tener al menos 6 caracteres", "error");
      return;
    }
    setIsChangingPass(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        addToast("Contraseña cambiada exitosamente", "success");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        addToast(data.error || "La contraseña actual es incorrecta", "error");
      }
    } catch (err) {
      addToast("Error de conexión", "error");
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeletePet = async () => {
    if (!petToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/pets/${petToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        addToast(`Mascota ${petToDelete.name} eliminada permanentemente`, "success");
        setPetToDelete(null);
        fetchPets();
        fetchNotifications();
      } else {
        addToast("Error al eliminar mascota", "error");
      }
    } catch (e) {
      addToast("Error de conexión", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchNotifications();
        addToast("Todas las alertas marcadas como leídas", "success");
      }
    } catch (e) {
      // ignore
    }
  };

  const handleDownloadQR = async (qrCodeId: string) => {
    try {
      const res = await fetch(`/api/pets/qr-png/${qrCodeId}`);
      if (!res.ok) throw new Error("Error fetching QR");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `petlink_qr_${qrCodeId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("Código QR descargado con éxito", "success");
    } catch (error) {
      console.error("Error descargando QR:", error);
      addToast("Error al descargar el código QR", "error");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-qr-area");
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir QR de ${qrToPrint?.name}</title>
            <style>
              body {
                font-family: system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                text-align: center;
              }
              .card {
                border: 2px solid #000;
                padding: 30px;
                border-radius: 20px;
                max-width: 400px;
              }
              img {
                width: 250px;
                height: 250px;
                margin-bottom: 20px;
              }
              h1 { margin: 0 0 10px 0; font-size: 28px; }
              p { margin: 0; color: #555; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🐾 ${qrToPrint?.name}</h1>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=0f172a&data=${encodeURIComponent(window.location.origin + '/pet/' + qrToPrint?.codeId)}" alt="QR" />
              <p>Escanea para ver información de contacto y salud</p>
              <p style="font-weight: bold; margin-top: 10px; font-size: 11px;">PETLINKQR.COM</p>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      addToast("Por favor, habilita las ventanas emergentes para imprimir", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-16 transition-colors duration-300">
      {/* Top Ribbon */}
      <div className="bg-slate-900 text-slate-300 py-3 px-6 border-b border-slate-800">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span className="font-mono">VISTA PANEL DE CONTROL PRIVADO</span>
          </div>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-1 bg-indigo-600 text-white font-semibold px-2.5 py-1 rounded hover:bg-indigo-700 transition"
            >
              <Sliders className="h-3 w-3" /> Panel Administrativo
            </Link>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow">
              <QrCode className="h-4.5 w-4.5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              PetLink<span className="text-indigo-600">QR</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              ID: {user?.id}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-2 rounded-xl transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 mt-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT: User Profile overview CARD */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm transition-colors duration-300">
              <div className="flex flex-col items-center text-center">
                <img
                  src={user?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={user?.name}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover shadow-md border-2 border-slate-100 dark:border-slate-800"
                />
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-4">{user?.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  <Clock className="h-3 w-3" /> Registrado: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("es-AR") : "---"}
                </span>
              </div>

              {/* Action tabs to shift focus - Adaptable grid on mobile, list on desktop */}
              <div className="mt-6 lg:mt-8 grid grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                <button
                  onClick={() => handleTabChange("pets")}
                  className={`flex flex-col sm:flex-row items-center justify-center lg:justify-between px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeTab === "pets"
                      ? "bg-slate-900 text-white dark:bg-indigo-600"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
                    <span className="text-sm">🐾</span>
                    <span>Mascotas</span>
                  </span>
                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold transition ${
                    activeTab === "pets"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  }`}>
                    {pets.length}
                  </span>
                </button>

                <button
                  onClick={() => handleTabChange("notifications")}
                  className={`flex flex-col sm:flex-row items-center justify-center lg:justify-between px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeTab === "notifications"
                      ? "bg-slate-900 text-white dark:bg-indigo-600"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
                    <Bell className="h-4 w-4 shrink-0" />
                    <span>Alertas</span>
                  </span>
                  {unreadCount > 0 ? (
                    <span className="bg-red-500 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                      {unreadCount}
                    </span>
                  ) : (
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold transition hidden lg:inline ${
                      activeTab === "notifications"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    }`}>
                      {notifications.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleTabChange("settings")}
                  className={`flex flex-col sm:flex-row items-center justify-center lg:justify-between px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeTab === "settings"
                      ? "bg-slate-900 text-white dark:bg-indigo-600"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
                    <Settings className="h-4 w-4 shrink-0" />
                    <span>Ajustes</span>
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-50 hidden lg:inline" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Primary dynamic tab area */}
          <div className="lg:col-span-8 scroll-mt-24" id="tab-content-area">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: Mis Mascotas list */}
              {activeTab === "pets" && (
                <motion.div
                  key="pets-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Mis Mascotas</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Registra, descarga códigos QR o modifica el estado de tus mascotas.</p>
                    </div>
                    <Link
                      to="/pet/add"
                      className="hidden md:flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 dark:hover:bg-indigo-500 transition"
                    >
                      <Plus className="h-4 w-4" /> Agregar Nueva
                    </Link>
                  </div>

                  {pets.length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center transition-colors">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 mb-4">
                        🐾
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">No tienes mascotas registradas</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        Comienza agregando tu primera mascota para generar su código QR único de forma inmediata.
                      </p>
                      <Link
                        to="/pet/add"
                        className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 dark:hover:bg-indigo-500 transition"
                      >
                        <Plus className="h-4 w-4" /> Registrar mi primera mascota
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {pets.map((pet) => (
                        <div
                          key={pet.id}
                          className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition relative flex flex-col justify-between ${
                            pet.status === "perdido"
                              ? "border-red-200 dark:border-red-900/60 bg-red-50/10 dark:bg-red-950/10"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                          }`}
                        >
                          {/* Header card info */}
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={pet.photoUrl}
                                  alt={pet.name}
                                  className="h-14 w-14 rounded-xl object-cover border border-slate-100 dark:border-slate-850 shadow-sm"
                                />
                                <div>
                                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    {pet.name}
                                  </h3>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{pet.species} • {pet.breed}</p>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-550 font-mono">ID QR: {pet.qrCodeId}</span>
                                </div>
                              </div>

                              {/* Status badge */}
                              {pet.status === "perdido" ? (
                                <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-950 px-2.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300 animate-pulse border border-red-200 dark:border-red-900/50">
                                  🚨 Perdido
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                                  🟢 En Casa
                                </span>
                              )}
                            </div>

                            {/* Scan counter */}
                            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 flex items-center justify-between text-xs mb-4">
                              <span className="text-slate-500 dark:text-slate-450">Escaneos registrados:</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-100/10 dark:border-indigo-900/10">
                                📊 {pet.scansCount}
                              </span>
                            </div>
                          </div>

                          {/* Footer Action buttons */}
                          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-wrap gap-2 justify-between">
                            <div className="flex gap-1">
                              <Link
                                to={`/pet/manage/${pet.id}`}
                                title="Ver escaneos e historial"
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                to={`/pet/edit/${pet.id}`}
                                title="Editar información"
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => setQrToPrint({ id: pet.id, name: pet.name, codeId: pet.qrCodeId })}
                                title="Ver / Imprimir código QR"
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
                              >
                                <QrCode className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadQR(pet.qrCodeId)}
                                title="Descargar código QR (PNG)"
                                className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition flex items-center justify-center border border-indigo-100/10 dark:border-indigo-900/10 cursor-pointer"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => setPetToDelete({ id: pet.id, name: pet.name })}
                              className="p-2 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition border border-red-100/10 dark:border-red-900/10"
                              title="Eliminar Mascota"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add new pet card block */}
                      <Link
                        to="/pet/add"
                        className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition min-h-[200px]"
                      >
                        <Plus className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                        <span className="font-display font-semibold text-slate-600 dark:text-slate-300">➕ Agregar nueva mascota</span>
                        <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">Registra otra mascota en tu cuenta</p>
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: Alertas / Notificaciones log */}
              {activeTab === "notifications" && (
                <motion.div
                  key="notifications-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Historial de Alertas</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Historial detallado de escaneos y reportes geográficos.</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Marcar todas como leídas
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-500 transition-colors">
                      <Bell className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">No hay alertas registradas</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Las alertas se dispararán automáticamente en el momento que alguien escanee el collar QR de tus mascotas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`rounded-2xl border p-4 shadow-xs flex items-start gap-3 transition ${
                            notif.isRead
                              ? "bg-white border-slate-100 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                              : "bg-indigo-50/20 border-indigo-100/80 text-slate-900 dark:bg-indigo-950/40 dark:border-indigo-900/40 dark:text-slate-100"
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            notif.type === "location" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/85 dark:text-emerald-300" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/85 dark:text-indigo-300"
                          }`}>
                            <QrCode className="h-4.5 w-4.5" />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                                {notif.title}
                              </h4>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                                {notif.date} a las {notif.time}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                              {notif.message}
                            </p>

                            {!notif.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-2 block"
                              >
                                ✓ Marcar como leída
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: Ajustes de Perfil / Contraseña */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Ajustes de Perfil</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configura tus datos de acceso e identidad pública.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* EDIT NAME / AVATAR */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
                      <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
                        <UserIcon className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" /> Datos Personales
                      </h3>
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre Completo</label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nombre"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 dark:focus:border-indigo-500 transition"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">URL Foto de Perfil</label>
                          <input
                            type="text"
                            value={editPhoto}
                            onChange={(e) => setEditPhoto(e.target.value)}
                            placeholder="https://ejemplo.com/foto.jpg"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 dark:focus:border-indigo-500 font-mono text-xs"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="w-full rounded-xl bg-slate-900 dark:bg-indigo-600 py-3 text-xs font-bold text-white shadow hover:bg-slate-800 dark:hover:bg-indigo-500 transition"
                        >
                          {isUpdatingProfile ? "Actualizando..." : "Guardar Cambios"}
                        </button>
                      </form>
                    </div>

                    {/* CHANGE PASSWORD */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
                      <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
                        <Lock className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" /> Seguridad de Acceso
                      </h3>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Contraseña Actual</label>
                          <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 dark:focus:border-indigo-500 transition"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Nueva Contraseña</label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 6 caracteres"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 dark:focus:border-indigo-500 transition"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isChangingPass}
                          className="w-full rounded-xl bg-slate-900 dark:bg-indigo-600 py-3 text-xs font-bold text-white shadow hover:bg-slate-800 dark:hover:bg-indigo-500 transition"
                        >
                          {isChangingPass ? "Modificando..." : "Cambiar Contraseña"}
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* MODAL 1: Confirm Delete Pet */}
      <AnimatePresence>
        {petToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-colors"
            >
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">¿Eliminar mascota?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                ¿Estás seguro de que deseas eliminar permanentemente a <span className="font-semibold text-slate-850 dark:text-slate-200">{petToDelete.name}</span>? Esta acción borrará su código QR, historial de escaneos y fotos de forma irreversible.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setPetToDelete(null)}
                  disabled={isDeleting}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeletePet}
                  disabled={isDeleting}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500 active:scale-98 transition disabled:opacity-50"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar de Por Vida"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: High Resolution QR Print Preview */}
      <AnimatePresence>
        {qrToPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl relative transition-colors"
            >
              <button
                onClick={() => setQrToPrint(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-display text-lg font-extrabold text-slate-900 dark:text-white mb-2">Impresión de Alta Resolución</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Esta es la chapa identificativa lista para recortar y adherir en el collar.</p>

              {/* Printable Target card area */}
              <div className="flex flex-col items-center justify-center border-2 border-slate-900 dark:border-slate-700 rounded-3xl p-6 bg-slate-50 dark:bg-slate-950 mx-auto max-w-[320px] transition-colors" id="printable-qr-area">
                <div className="text-center font-display font-extrabold text-slate-950 dark:text-white text-xl tracking-tight flex items-center gap-1.5 justify-center">
                  🐾 {qrToPrint.name}
                </div>
                <div className="my-5 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex justify-center items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=0f172a&data=${encodeURIComponent(window.location.origin + "/pet/" + qrToPrint.codeId)}`}
                    alt="Pet QR Code"
                    className="h-44 w-44"
                  />
                </div>
                <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                  Escanea para ubicar a mi dueño
                </div>
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                  PETLINKQR.COM
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setQrToPrint(null)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cerrar
                </button>
                <button
                  onClick={handlePrint}
                  className="rounded-xl bg-slate-900 dark:bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:hover:bg-indigo-500 transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Lanzar Impresión
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for mobile devices when on pets tab */}
      {activeTab === "pets" && (
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <Link
            to="/pet/add"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 dark:bg-indigo-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-250 focus:outline-none"
            aria-label="Agregar Nueva Mascota"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>
      )}
    </div>
  );
}
