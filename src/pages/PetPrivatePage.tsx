import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { fetch } from "../mockApi";
import {
  ArrowLeft,
  QrCode,
  MapPin,
  Clock,
  Smartphone,
  Info,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Lock,
  Compass,
  CheckCircle,
  Eye,
  Check,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PetPrivatePage() {
  const { id } = useParams();
  const { token, addToast, fetchPets, darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();

  const [pet, setPet] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    // Fetch pet details
    fetch(`/api/pets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("No tienes autorización para administrar esta mascota");
        return res.json();
      })
      .then((data) => {
        setPet(data);
        return fetch(`/api/pets/${data.id}/scans`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      })
      .then((res) => res.json())
      .then((scanData) => {
        setScans(scanData);
      })
      .catch((err) => {
        addToast(err.message || "Error al cargar la mascota", "error");
        navigate("/dashboard");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, token]);

  const handleRegenerateQr = async () => {
    if (!pet) return;
    setIsRegenerating(true);

    try {
      const res = await fetch(`/api/pets/${pet.id}/regenerate-qr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setPet((prev: any) => ({ ...prev, qrCodeId: data.qrCodeId }));
        addToast("Código QR regenerado con éxito. El QR anterior ya no funcionará.", "success");
        fetchPets();
      } else {
        addToast(data.error || "Error al regenerar código QR", "error");
      }
    } catch (e) {
      addToast("Error de conexión", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!pet) return;
    const newStatus = pet.status === "casa" ? "perdido" : "casa";

    try {
      const res = await fetch(`/api/pets/${pet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const updated = await res.json();
      if (res.ok) {
        setPet(updated);
        addToast(
          newStatus === "perdido"
            ? "Mascota marcada como PERDIDA. Alertas de emergencia activas."
            : "Mascota marcada como SEGURA en casa.",
          "success"
        );
        fetchPets();
      }
    } catch (e) {
      addToast("Error al cambiar estado", "error");
    }
  };

  const handleDownloadQR = async () => {
    if (!pet) return;
    try {
      const res = await fetch(`/api/pets/qr-png/${pet.qrCodeId}`);
      if (!res.ok) throw new Error("Error fetching QR");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `petlink_qr_${pet.qrCodeId}.png`;
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center space-y-2">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Buscando historial de escaneos de tu mascota...</p>
        </div>
      </div>
    );
  }

  // Find the last scan that has GPS coordinates to show on the radar mock
  const lastGpsScan = scans.find((s) => s.latitude && s.longitude);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 font-sans pb-20 transition-colors text-slate-800 dark:text-slate-100">
      
      {/* Header bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 sticky top-0 z-30 shadow-xs transition-colors">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a mi Panel
          </Link>

          <span className="font-display font-bold text-slate-900 dark:text-white text-sm">
            Ficha de Control: {pet?.name}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 mt-8">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT COLUMN: Pet summary controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* overview block */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center gap-3">
                <img
                  src={pet.photoUrl}
                  alt={pet.name}
                  className="h-16 w-16 rounded-2xl object-cover shadow border border-slate-100 dark:border-slate-800"
                />
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{pet.name}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{pet.species} • {pet.breed}</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Código QR: {pet.qrCodeId}</span>
                </div>
              </div>

              {/* Status Indicator switcher */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Estado de Búsqueda</span>
                <button
                  onClick={handleStatusToggle}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition shadow-sm ${
                    pet.status === "perdido"
                      ? "bg-red-600 text-white hover:bg-red-500"
                      : "bg-emerald-600 text-white hover:bg-emerald-500"
                  }`}
                >
                  <span>{pet.status === "perdido" ? "🚨 PERDIDO (Alerta Activa)" : "🟢 SEGURO (En casa)"}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider">Cambiar</span>
                </button>
              </div>

              {/* QR Code Action cards */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Administrar Identificador</span>
                
                <button
                  onClick={handleDownloadQR}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <QrCode className="h-4 w-4 text-slate-500 dark:text-slate-400" /> Descargar QR para Imprimir
                </button>

                <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 p-3 text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed border border-indigo-100/30 dark:border-indigo-800/40">
                  <span className="font-bold block mb-1 text-indigo-900 dark:text-indigo-200">✨ Identificador Permanente</span>
                  Este código QR es único de <strong>{pet.name}</strong>, nunca vence y no cambiará jamás. Puedes grabarlo o imprimirlo en chapas, collares o llaveros con total tranquilidad.
                </div>
              </div>
            </div>

            {/* Quick emergency notice */}
            {pet.status === "perdido" && (
              <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4 space-y-2 text-xs text-red-700 dark:text-red-300">
                <div className="flex gap-1.5 items-center font-bold text-red-900 dark:text-red-200">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-600 animate-pulse shrink-0" />
                  <span>Modo Búsqueda Activo</span>
                </div>
                <p className="leading-relaxed">
                  Cualquier escaneo del collar dirigirá al rescatista a una interfaz roja de auxilio rápido para llamarte de inmediato.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Scans ledger and Locator Map mock */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* EMERGENCY GPS RADAR MOCK */}
            {lastGpsScan && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-red-500 animate-spin" />
                  <div>
                    <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Radar de Localización GPS</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Último punto de coordenadas reportado por el rescatista.</p>
                  </div>
                </div>

                {/* Satellite CSS SVG graphic mockup */}
                <div className="relative h-60 w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                  
                  {/* Glowing radar ripples */}
                  <div className="absolute h-40 w-40 rounded-full border border-red-500/30 animate-ping" />
                  <div className="absolute h-24 w-24 rounded-full border border-red-500/20" />
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

                  {/* Simulated Map Markers */}
                  <div className="absolute text-center z-10 space-y-2">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg border-2 border-white animate-bounce">
                      📍
                    </div>
                    <div className="rounded-lg bg-slate-900/90 text-white text-[10px] font-mono p-1.5 border border-slate-800 shadow">
                      Coordenadas: {lastGpsScan.latitude?.toFixed(4)}, {lastGpsScan.longitude?.toFixed(4)} <br />
                      Ubicación: {lastGpsScan.city}, Argentina
                    </div>
                  </div>

                  {/* Map watermark overlay */}
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    PetLink Satellite Map Simulator
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-3 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <strong className="text-slate-900 dark:text-white">Ubicación exacta de GPS:</strong> Latitud: {lastGpsScan.latitude}, Longitud: {lastGpsScan.longitude}.
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lastGpsScan.latitude},${lastGpsScan.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-3.5 py-2 rounded-xl shadow-md transition cursor-pointer shrink-0"
                  >
                    🗺️ Trazar Ruta en Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* SCAN LOGS TABLE LEDGER */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm mb-4">Historial de Escaneos</h3>

              {scans.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
                  <Smartphone className="mx-auto h-12 w-12 text-slate-250 dark:text-slate-800" />
                  <h4 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm">Aún no hay escaneos</h4>
                  <p className="text-xs max-w-xs mx-auto">
                    Cuando una persona escanee el código QR con un teléfono móvil, se registrará el evento aquí inmediatamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scans.map((scan) => (
                    <div
                      key={scan.id}
                      className={`rounded-2xl border p-4 shadow-xs transition ${
                        scan.latitude && scan.longitude
                          ? "border-emerald-100 dark:border-emerald-950 bg-emerald-50/5 dark:bg-emerald-950/10"
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100/60 dark:border-slate-800/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450">
                            <Smartphone className="h-4 w-4" />
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-white">Escaneado desde: {scan.city}, {scan.country}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">IP de conexión: {scan.ip}</span>
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {scan.date} a las {scan.time}
                        </div>
                      </div>

                      {/* Device client properties */}
                      <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <div>
                          <strong>Disp:</strong> {scan.device || "Mobile"}
                        </div>
                        <div>
                          <strong>S.O.:</strong> {scan.os || "Desconocido"}
                        </div>
                        <div>
                          <strong>Navegador:</strong> {scan.browser || "Desconocido"}
                        </div>
                      </div>

                      {/* comments if provided */}
                      {scan.comment && (
                        <div className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          "{scan.comment}"
                        </div>
                      )}

                      {/* Coordinates trigger indicator */}
                      {scan.latitude && scan.longitude && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg w-fit border border-emerald-100 dark:border-emerald-900/60">
                            <Check className="h-3.5 w-3.5" /> Ubicación satelital disponible: {scan.latitude.toFixed(6)}, {scan.longitude.toFixed(6)}
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${scan.latitude},${scan.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                            >
                              📍 Ver en Google Maps
                            </a>
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${scan.latitude}&mlon=${scan.longitude}#map=18/${scan.latitude}/${scan.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-750 transition cursor-pointer"
                            >
                              🗺️ OpenStreetMap
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
