import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { fetch } from "../mockApi";
import {
  MapPin,
  RotateCw,
  ArrowLeft,
  AlertTriangle,
  QrCode,
  Search,
  Check,
  Sun,
  Moon
} from "lucide-react";
import { motion } from "motion/react";

export default function LostPetsPage() {
  const { user, darkMode, toggleDarkMode, addToast } = useApp();
  const navigate = useNavigate();

  const [lostPets, setLostPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("all");

  const fetchLostPets = async (showRefreshingIndicator = false) => {
    if (showRefreshingIndicator) setIsRefreshing(true);
    try {
      const res = await fetch("/api/pets/public/lost");
      if (res.ok) {
        const data = await res.json();
        setLostPets(data);
      }
    } catch (err) {
      console.error("Error al obtener mascotas perdidas", err);
      addToast("Error al sincronizar la red de alertas", "error");
    } finally {
      setLoading(false);
      if (showRefreshingIndicator) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    fetchLostPets();

    // Poll every 5 seconds to keep it synchronized in real-time
    const interval = setInterval(() => {
      fetchLostPets();
    }, 5000);

    // Sync from local storage changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "petlink_db") {
        fetchLostPets();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleManualRefresh = () => {
    fetchLostPets(true);
    addToast("Red de mascotas perdidas actualizada", "info");
  };

  // Filter logic
  const filteredPets = lostPets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pet.ownerContact?.city && pet.ownerContact.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pet.color.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecies = selectedSpecies === "all" || pet.species.toLowerCase() === selectedSpecies.toLowerCase();

    return matchesSearch && matchesSpecies;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 font-sans pb-20 transition-colors text-slate-800 dark:text-slate-100">
      
      {/* Top Header Navigation */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 sticky top-0 z-30 shadow-xs transition-colors">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a mi Panel
          </Link>

          <span className="font-display font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Red de Alertas en Vivo
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 mt-8">
        
        {/* Page Title & Status */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-200/50">
              🚨 COMUNIDAD ACTIVA
            </span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Mascotas Perdidas Registradas
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Aquí puedes ver los reportes activos de mascotas perdidas. Si reconoces a alguna de ellas, entra a su perfil y ponte en contacto con sus dueños o comparte su ubicación.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Autosincronizado
            </span>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-50 transition cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 text-indigo-500 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-8 grid gap-4 md:grid-cols-12 items-center transition-colors shadow-xs">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, raza, ciudad, color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-slate-350 dark:focus:border-slate-700 transition"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold shrink-0">Especie:</span>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-slate-350 dark:focus:border-slate-750"
            >
              <option value="all">Todas las especies</option>
              <option value="perro">🐶 Perros</option>
              <option value="gato">🐱 Gatos</option>
              <option value="otro">🐾 Otros</option>
            </select>
          </div>

          <div className="md:col-span-2 text-right">
            <span className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 py-1.5 px-3 rounded-lg">
              {filteredPets.length} {filteredPets.length === 1 ? "Alerta" : "Alertas"}
            </span>
          </div>
        </div>

        {/* Pets Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400" />
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 max-w-lg mx-auto space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 font-bold text-xl">
              🎉
            </div>
            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-slate-900 dark:text-white">Ninguna alerta coincide</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {lostPets.length === 0
                  ? "¡Buenas noticias! Actualmente no hay alertas de mascotas perdidas activas en todo el sistema."
                  : "Prueba modificando los filtros de búsqueda o seleccionando otra especie."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPets.map((pet) => (
              <div
                key={pet.id}
                className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Emergency top banner accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500"></div>

                <div>
                  {/* Photo container */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                    <img
                      src={pet.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300"}
                      alt={pet.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase font-black tracking-wider shadow-sm animate-pulse">
                        🚨 PERDIDO
                      </span>
                      {pet.ownerContact?.city && (
                        <span className="bg-black/70 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                          <MapPin className="h-2.5 w-2.5 text-red-400 shrink-0" /> {pet.ownerContact.city.split(",")[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {pet.name}
                      </h3>
                      <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 uppercase">
                        {pet.species === "perro" ? "🐶 Perro" : pet.species === "gato" ? "🐱 Gato" : "🐾 Otro"}
                      </span>
                    </div>
                    
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {pet.breed || "Raza desconocida"} • {pet.color}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      "{pet.description || 'Sin descripción detallada por el momento.'}"
                    </p>
                  </div>
                </div>

                {/* Bottom detail or observations and actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  {pet.observations && (
                    <div className="text-[10px] text-red-700 dark:text-red-400 font-bold bg-red-50/50 dark:bg-red-950/20 px-2 py-1 rounded-lg border border-red-100/50 dark:border-red-900/20 truncate">
                      ⚠️ Obs: {pet.observations}
                    </div>
                  )}

                  <Link
                    to={`/pet/${pet.id}`}
                    className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-red-600 hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600 py-2.5 text-xs font-bold text-white shadow-xs hover:shadow transition text-center"
                  >
                    🐾 Ayudar a Reencontrar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
