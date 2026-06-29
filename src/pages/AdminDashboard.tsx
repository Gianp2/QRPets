import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { fetch } from "../mockApi";
import {
  Shield,
  ArrowLeft,
  Users,
  Heart,
  QrCode,
  Smartphone,
  Search,
  Lock,
  Unlock,
  Trash2,
  Sliders,
  BarChart,
  Loader2,
  Eye,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminDashboard() {
  const { token, user, addToast } = useApp();
  const navigate = useNavigate();

  // Safety guard redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      addToast("Acceso denegado. Se requiere rol de administrador.", "error");
      navigate("/dashboard");
    }
  }, [user]);

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminPets, setAdminPets] = useState<any[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"users" | "pets">("users");

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const [resStats, resUsers, resPets] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/pets", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resStats.ok && resUsers.ok && resPets.ok) {
        setStats(await resStats.json());
        setAdminUsers(await resUsers.json());
        setAdminPets(await resPets.json());
      } else {
        addToast("Error al cargar datos administrativos", "error");
      }
    } catch (e) {
      addToast("Error de conexión", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleBlockUser = async (id: string, isBlocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/block`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ block: !isBlocked })
      });

      if (res.ok) {
        addToast(!isBlocked ? "Usuario bloqueado" : "Usuario desbloqueado", "success");
        loadData();
      } else {
        const data = await res.json();
        addToast(data.error || "No se pudo realizar la acción", "error");
      }
    } catch (e) {
      addToast("Error de conexión", "error");
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario ${name} y todas sus mascotas? Esta acción es irreversible.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        addToast("Usuario purgado con éxito", "success");
        loadData();
      } else {
        const data = await res.json();
        addToast(data.error || "No se pudo eliminar al usuario", "error");
      }
    } catch (e) {
      addToast("Error de conexión", "error");
    }
  };

  const handleDeletePet = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la mascota ${name} de la plataforma?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        addToast("Mascota eliminada del sistema", "success");
        loadData();
      }
    } catch (e) {
      addToast("Error de conexión", "error");
    }
  };

  // Filters logic
  const filteredUsers = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPets = adminPets.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500">Cargando métricas globales de la plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Header bar */}
      <header className="bg-slate-950 text-white border-b border-slate-900 py-4 px-6 sticky top-0 z-30 shadow-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Panel de Control
          </Link>

          <span className="font-display font-bold text-indigo-400 text-sm flex items-center gap-1.5">
            <Shield className="h-4.5 w-4.5" /> Consola de Administración Global
          </span>

          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-8 space-y-8">
        
        {/* PLATFORM METRICS */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usuarios Registrados</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalUsers || 0}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mascotas Registradas</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalPets || 0}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mascotas Perdidas</div>
              <div className="text-2xl font-extrabold text-red-600 mt-1">{stats?.lostPets || 0}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Escaneos QR</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalScans || 0}</div>
            </div>
          </div>
        </div>

        {/* CONTROLS & DIRECTORY SECTION */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          
          {/* Sub-tab selection bar and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => {
                  setActiveSubTab("users");
                  setSearchQuery("");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeSubTab === "users" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                👥 Gestionar Usuarios ({filteredUsers.length})
              </button>
              <button
                onClick={() => {
                  setActiveSubTab("pets");
                  setSearchQuery("");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeSubTab === "pets" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                🐾 Gestionar Mascotas ({filteredPets.length})
              </button>
            </div>

            <div className="relative max-w-sm w-full">
              <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeSubTab === "users" ? "Buscar por nombre o email..." : "Buscar mascota o email dueño..."}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-slate-400 focus:bg-white transition"
              />
            </div>
          </div>

          {/* TAB 1: users control */}
          {activeSubTab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="pb-3 font-semibold">Usuario</th>
                    <th className="pb-3 font-semibold">Correo Electrónico</th>
                    <th className="pb-3 font-semibold">Registrado</th>
                    <th className="pb-3 font-semibold text-center">Mascotas</th>
                    <th className="pb-3 font-semibold text-center">Estado</th>
                    <th className="pb-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 italic">
                        No se encontraron usuarios con ese criterio.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                        <td className="py-3.5 flex items-center gap-2.5">
                          <img
                            src={u.photoUrl}
                            alt={u.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{u.role}</span>
                          </div>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-800">{u.email}</td>
                        <td className="py-3.5 text-slate-500">{new Date(u.createdAt).toLocaleDateString("es-AR")}</td>
                        <td className="py-3.5 text-center font-bold text-slate-800">{u.petsCount}</td>
                        <td className="py-3.5 text-center">
                          {u.isBlocked ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[9px] font-bold text-red-700">
                              Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right space-x-1.5">
                          {u.id !== "admin-1" && (
                            <>
                              <button
                                onClick={() => handleBlockUser(u.id, u.isBlocked)}
                                className={`p-1.5 rounded-lg border text-xs font-semibold transition ${
                                  u.isBlocked
                                    ? "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                                title={u.isBlocked ? "Desbloquear" : "Bloquear"}
                              >
                                {u.isBlocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                                title="Eliminar Perfil permanentemente"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeSubTab === "pets" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="pb-3 font-semibold">Mascota</th>
                    <th className="pb-3 font-semibold">Dueño (Propietario)</th>
                    <th className="pb-3 font-semibold">Código QR</th>
                    <th className="pb-3 font-semibold text-center">Escaneos</th>
                    <th className="pb-3 font-semibold text-center">Estado</th>
                    <th className="pb-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 italic">
                        No se encontraron mascotas con ese criterio.
                      </td>
                    </tr>
                  ) : (
                    filteredPets.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                        <td className="py-3.5 flex items-center gap-2.5">
                          <img
                            src={p.photoUrl}
                            alt={p.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-[10px] text-slate-400">{p.species} • {p.breed}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="font-semibold text-slate-800 block">{p.ownerName}</span>
                          <span className="text-[10px] text-slate-400">{p.ownerEmail}</span>
                        </td>
                        <td className="py-3.5 font-mono text-xs font-semibold text-slate-500">{p.qrCodeId}</td>
                        <td className="py-3.5 text-center font-bold text-slate-800">{p.scansCount}</td>
                        <td className="py-3.5 text-center">
                          {p.status === "perdido" ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[9px] font-bold text-red-700 animate-pulse">
                              🚨 Perdida
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              🟢 En casa
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right space-x-1.5">
                          <Link
                            to={`/pet/${p.id}`}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                            title="Ver perfil público"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          
                          <button
                            onClick={() => handleDeletePet(p.id, p.name)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Borrar Mascota"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
