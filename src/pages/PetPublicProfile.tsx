import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { fetch } from "../mockApi";
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Heart,
  Shield,
  Clock,
  AlertTriangle,
  Loader2,
  Check,
  Send,
  Info,
  QrCode,
  Sun,
  Moon
} from "lucide-react";
import { motion } from "motion/react";

export default function PetPublicProfile() {
  const { id } = useParams(); // Can be pet ID or QR Code ID
  const { addToast, darkMode, toggleDarkMode } = useApp();

  const [pet, setPet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Location and comment submission
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Fetch pet public details on mount and trigger an automatic baseline scan if marked as lost
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    fetch(`/api/pets/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Perfil de mascota no encontrado o privado");
        return res.json();
      })
      .then(async (data) => {
        setPet(data);
        
        // Trigger background silent scan log only if marked as lost
        if (data.status === "perdido") {
          let realCity = "";
          let realCountry = "";
          try {
            const ipRes = await fetch("https://ipapi.co/json/");
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.city) realCity = ipData.city;
              if (ipData.country_name) realCountry = ipData.country_name;
            }
          } catch (e) {
            // ignore
          }

          fetch(`/api/pets/scan/${data.qrCodeId || data.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comment: "Escaneo de código QR (automático)",
              city: realCity || undefined,
              country: realCountry || undefined
            })
          }).catch(() => {}); // silent catch
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || "Error al cargar la mascota");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  // Request GPS Location from rescuer's browser
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      addToast("Tu navegador no soporta geolocalización de GPS", "error");
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setGpsSuccess(true);
        setGpsLoading(false);
        addToast("Ubicación GPS capturada con éxito", "success");

        // Try to reverse-geocode to get exact street address using free Nominatim API
        let addressComment = "📍 Ubicación GPS compartida por el rescatista";
        let resolvedCity = "";
        let resolvedCountry = "";
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.display_name) {
              addressComment = `📍 Ubicación exacta: ${geoData.display_name}`;
            }
            if (geoData.address) {
              resolvedCity = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.suburb || "";
              resolvedCountry = geoData.address.country || "";
            }
          }
        } catch (e) {
          // ignore
        }

        // Immediately trigger scan update with GPS coordinates and precise address
        if (pet) {
          fetch(`/api/pets/scan/${pet.qrCodeId || pet.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: lat,
              longitude: lng,
              comment: addressComment,
              city: resolvedCity || undefined,
              country: resolvedCountry || undefined
            })
          })
            .then(() => {
              addToast("Dirección exacta y coordenadas enviadas al dueño en tiempo real", "success");
            })
            .catch(() => {});
        }
      },
      (error) => {
        setGpsLoading(false);
        addToast("No se pudo obtener la ubicación. Por favor, concede permisos en tu navegador", "error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Submit comment and custom location
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) {
      addToast("Escribe un comentario o estado para enviar", "error");
      return;
    }
    setIsSubmittingReport(true);

    try {
      const res = await fetch(`/api/pets/scan/${pet.qrCodeId || pet.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: latitude || undefined,
          longitude: longitude || undefined,
          comment
        })
      });

      if (res.ok) {
        setReportSuccess(true);
        setComment("");
        addToast("Reporte de hallazgo enviado al dueño", "success");
      } else {
        addToast("Ocurrió un error al enviar el reporte", "error");
      }
    } catch (err) {
      addToast("Error de conexión", "error");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Age calculator
  const calculateAge = (dateStr: string) => {
    if (!dateStr) return "Desconocida";
    const birth = new Date(dateStr);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }

    if (years === 0) {
      return months === 1 ? "1 mes" : `${months} meses`;
    }
    return years === 1 ? "1 año" : `${years} años`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center space-y-2">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Cargando perfil público de la mascota...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !pet) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors">
        <div className="text-center max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl transition-colors">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 text-red-500 dark:text-red-400 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Perfil Privado o No Encontrado</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            El perfil que intentas escanear no existe o ha sido configurado como privado por su propietario de forma temporal.
          </p>
        </div>
      </div>
    );
  }

  const isLost = pet.status === "perdido";

  if (!isLost) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex items-center justify-center p-4 relative transition-colors text-slate-800 dark:text-slate-100">
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 shadow-md transition"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl text-center space-y-6 transition-colors"
        >
          <div className="mx-auto h-24 w-24 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-500 dark:text-emerald-400 relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 animate-ping" />
            <Heart className="h-12 w-12 fill-emerald-500 dark:fill-emerald-400 text-emerald-500 dark:text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">
              ¡{pet.name} está a salvo! 💚
            </h2>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/60 py-1.5 px-4 rounded-full inline-block">
              Estado: Seguro en Casa 🐾
            </p>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            El código QR de <strong>{pet.name}</strong> está desactivado temporalmente de forma preventiva porque se encuentra seguro con su familia. 
          </p>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 text-left text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <p className="font-bold text-slate-700 dark:text-slate-300">🔒 Protección y Privacidad:</p>
            <p>
              Por motivos de seguridad, los datos de contacto y la ubicación de las mascotas solo son visibles públicamente cuando sus dueños las declaran como <strong>Perdidas</strong> en la plataforma.
            </p>
          </div>

          <div className="pt-2">
            <a 
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 dark:bg-indigo-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:hover:bg-indigo-750 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              Ir a la Página Principal
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 font-sans pb-20 relative transition-colors text-slate-800 dark:text-slate-100">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 shadow-lg transition"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
      
      {/* emergency alert ribbon */}
      {isLost && (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-3.5 px-6 font-display font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle className="h-4.5 w-4.5" />
          <span>¡ATENCIÓN! ESTA MASCOTA SE ENCUENTRA PERDIDA. POR FAVOR, COMUNÍCATE CON SU DUEÑO.</span>
        </div>
      )}
      
      {/* Main Profile container */}
      <main className="mx-auto max-w-2xl px-4 mt-6">
        
        {/* PET PUBLIC CARD HERO */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden mb-6 transition-colors">
          
          {/* Big Photo display */}
          <div className="relative h-64 md:h-80 w-full bg-slate-100 dark:bg-slate-950">
            <img
              src={pet.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600"}
              alt={pet.name}
              className="h-full w-full object-cover"
            />
            {/* status watermark pill */}
            <div className="absolute bottom-4 left-4">
              {isLost ? (
                <span className="inline-flex items-center rounded-full bg-red-600 px-4 py-1.5 text-xs font-extrabold text-white shadow-md border border-red-500 tracking-wide animate-pulse">
                  🚨 MASCOTA PERDIDA
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-extrabold text-white shadow-md border border-emerald-500 tracking-wide">
                  🟢 EN CASA / SEGURO
                </span>
              )}
            </div>
          </div>

          {/* Core metadata text */}
          <div className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{pet.name}</h1>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{pet.species} • {pet.breed}</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-3 py-1 rounded-full font-bold">
                  ⚖ {pet.weight} Kg
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-3 py-1 rounded-full font-bold">
                  🎂 {calculateAge(pet.birthDate)}
                </span>
              </div>
            </div>

            {/* Description card */}
            <div className="my-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Acerca de {pet.name}</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                {pet.description || "Su dueño no ha agregado una descripción detallada de comportamiento."}
              </p>
            </div>

            {/* MEDICAL DATA */}
            <div className="space-y-4 my-6 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display">Ficha de Salud Crítica</h3>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-3.5">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">⚠️ Alergias</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{pet.allergies || "Ninguna registrada"}</div>
                </div>

                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955 p-3.5">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">💊 Medicación importante</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{pet.medication || "Ninguna registrada"}</div>
                </div>

                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955 p-3.5">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">🩺 Enfermedades</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{pet.illnesses || "Ninguna registrada"}</div>
                </div>

                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955 p-3.5">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">🏪 Clínica de Confianza</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{pet.vetName || "No especificada"}</div>
                </div>
              </div>

              {pet.observations && (
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955 p-4 mt-2">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">✏️ Observaciones de cuidados</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{pet.observations}</p>
                </div>
              )}
            </div>

            {/* OWNER SECURE DIRECT CONTACT ACTIONS */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Contacto con el Propietario</h3>

              <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 flex gap-3">
                <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Ubicación aproximada del hogar:</strong> {pet.ownerContact?.city || "No provista"}
                  {pet.ownerContact?.address && ` (${pet.ownerContact.address})`}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid gap-3 sm:grid-cols-3">
                {pet.ownerContact?.phone && (
                  <a
                    href={`tel:${pet.ownerContact.phone}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 py-3.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:hover:bg-slate-700 transition active:scale-98"
                  >
                    <Phone className="h-4 w-4" /> Llamar al Dueño
                  </a>
                )}

                {pet.ownerContact?.whatsapp && (
                  <a
                    href={`https://wa.me/${pet.ownerContact.whatsapp}?text=Hola,%20encontré%20a%20tu%20mascota%20${encodeURIComponent(pet.name)}.%20Por%20favor%20comunícate%20conmigo.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition active:scale-98"
                  >
                    <MessageSquare className="h-4 w-4" /> WhatsApp Directo
                  </a>
                )}

                {pet.ownerContact?.email && (
                  <a
                    href={`mailto:${pet.ownerContact.email}?subject=Encontré%20a%20tu%20mascota:%20${encodeURIComponent(pet.name)}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-750 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Mail className="h-4 w-4" /> Enviar Correo
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* GPS TRANSMISSION PLATFORM */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl mb-6 space-y-4 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 shrink-0 mt-0.5">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">📍 Compartir mi Ubicación GPS</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Si estás frente a la mascota ahora mismo, comparte tu ubicación geográfica. El propietario recibirá un mapa detallado en tiempo real con las coordenadas de rescate.
              </p>
            </div>
          </div>

          <div className="pt-2">
            {gpsSuccess ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" /> ¡Coordenadas GPS enviadas al dueño con éxito!
              </div>
            ) : (
              <button
                onClick={handleShareLocation}
                disabled={gpsLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 font-display font-bold text-white shadow-lg hover:bg-red-500 active:scale-98 transition disabled:opacity-50"
              >
                {gpsLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" /> Obteniendo coordenadas satelitales...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4.5 w-4.5" /> Enviar mi ubicación actual
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* COMPLEMENTARY MESSAGES FEED */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4 transition-colors">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
            ✏️ Enviar mensaje de hallazgo
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cuéntale al propietario en qué condiciones encontraste al animal o en qué punto lo dejaste resguardado.</p>

          {reportSuccess ? (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-955/40 border border-emerald-200 dark:border-emerald-900/60 p-4 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" /> ¡Comentario enviado al dueño por correo y panel de control!
            </div>
          ) : (
            <form onSubmit={handleSendReport} className="space-y-4">
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ej: Lo encontré tomando agua en el kiosco de la calle Pellegrini. Está tranquilo, lo tengo en mis brazos..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm h-28 resize-none outline-none text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-900 transition"
              />

              <button
                type="submit"
                disabled={isSubmittingReport}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 py-3.5 font-display font-bold text-white shadow-lg hover:bg-slate-800 dark:hover:bg-indigo-700 transition"
              >
                {isSubmittingReport ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Procesando envío...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Transmitir Mensaje de Auxilio
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* branding footer */}
        <div className="mt-10 flex flex-col items-center text-center text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1">
            <QrCode className="h-4 w-4" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">PetLinkQR</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500">Plataforma libre y solidaria para el reencuentro de mascotas.</p>
        </div>

      </main>
    </div>
  );
}
