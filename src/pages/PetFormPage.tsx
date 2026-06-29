import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetch } from "../mockApi";
import {
  ArrowLeft,
  Loader2,
  Heart,
  Activity,
  User as UserIcon,
  Shield,
  Save,
  Check,
  AlertTriangle,
  QrCode,
  Sun,
  Moon
} from "lucide-react";
import { motion } from "motion/react";

export default function PetFormPage() {
  const { token, addToast, fetchPets, darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const { id } = useParams(); // If present, we are in EDIT mode
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Form States
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500");
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Perro");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState<"macho" | "hembra">("macho");
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [color, setColor] = useState("");
  const [microchipNumber, setMicrochipNumber] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"casa" | "perdido">("casa");

  // Medical Ledger
  const [allergies, setAllergies] = useState("");
  const [medication, setMedication] = useState("");
  const [illnesses, setIllnesses] = useState("");
  const [vetName, setVetName] = useState("");
  const [observations, setObservations] = useState("");

  // Owner Contacts
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerWhatsapp, setOwnerWhatsapp] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerCity, setOwnerCity] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");

  // Preset Photo library options
  const photoPresets = [
    { name: "Golden", url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400" },
    { name: "Bulldog", url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400" },
    { name: "Pastor", url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400" },
    { name: "Husky", url: "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?w=400" },
    { name: "Gato Naranja", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400" },
    { name: "Gato Blanco", url: "https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=400" },
    { name: "Gato Gris", url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400" },
    { name: "Loro", url: "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?w=400" }
  ];

  // Fetch pet if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setIsFetching(true);
      fetch(`/api/pets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Mascota no encontrada");
          return res.json();
        })
        .then((data) => {
          setPhotoUrl(data.photoUrl);
          setName(data.name);
          setSpecies(data.species);
          setBreed(data.breed);
          setGender(data.gender);
          setBirthDate(data.birthDate);
          setWeight(data.weight.toString());
          setColor(data.color);
          setMicrochipNumber(data.microchipNumber || "");
          setDescription(data.description);
          setStatus(data.status);

          // medical
          setAllergies(data.allergies || "");
          setMedication(data.medication || "");
          setIllnesses(data.illnesses || "");
          setVetName(data.vetName || "");
          setObservations(data.observations || "");

          // contacts
          setOwnerName(data.ownerContact?.name || "");
          setOwnerPhone(data.ownerContact?.phone || "");
          setOwnerWhatsapp(data.ownerContact?.whatsapp || "");
          setOwnerEmail(data.ownerContact?.email || "");
          setOwnerCity(data.ownerContact?.city || "");
          setOwnerAddress(data.ownerContact?.address || "");
        })
        .catch((err) => {
          addToast("Error al cargar la mascota", "error");
          navigate("/dashboard");
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else {
      // In ADD mode, fill contact defaults from logged user
      const storedUser = localStorage.getItem("petlink_user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          setOwnerName(u.name);
          setOwnerEmail(u.email);
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [id, isEditMode, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !species || !breed) {
      addToast("Por favor completa los campos obligatorios.", "error");
      return;
    }
    setIsLoading(true);

    const payload = {
      photoUrl,
      name,
      species,
      breed,
      gender,
      birthDate,
      weight: Number(weight) || 0,
      color,
      microchipNumber,
      description,
      status,
      allergies,
      medication,
      illnesses,
      vetName,
      observations,
      ownerContact: {
        name: ownerName,
        phone: ownerPhone,
        whatsapp: ownerWhatsapp,
        email: ownerEmail,
        city: ownerCity,
        address: ownerAddress
      }
    };

    try {
      const url = isEditMode ? `/api/pets/${id}` : "/api/pets";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast(
          isEditMode ? "Mascota modificada con éxito" : "¡Mascota registrada correctamente!",
          "success"
        );
        fetchPets(); // Refresh state list
        navigate("/dashboard");
      } else {
        const err = await res.json();
        addToast(err.error || "Ocurrió un error al guardar", "error");
      }
    } catch (err) {
      addToast("Error de conexión", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Human-readable age calculator
  const calculateAge = (dateStr: string) => {
    if (!dateStr) return "";
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

  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center space-y-2">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Buscando datos de mascota...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 font-sans pb-20 transition-colors text-slate-800 dark:text-slate-100">
      {/* Header bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 sticky top-0 z-30 shadow-xs transition-colors">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Panel
          </Link>

          <span className="font-display font-bold text-slate-900 dark:text-white text-sm">
            {isEditMode ? "Editar Ficha de Mascota" : "Registrar Nueva Mascota"}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 mt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* PHOTO SELECTION */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition-colors">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base mb-2">Foto de tu Mascota</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Selecciona uno de los accesos directos o ingresa una URL de foto de internet.</p>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src={photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500"}
                alt="Pet Preview"
                className="h-32 w-32 rounded-2xl object-cover shadow-md border border-slate-200 dark:border-slate-800"
              />

              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">URL de Imagen</label>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://ejemplo.com/perro.jpg"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs font-mono text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition"
                  />
                </div>

                {/* presets shortcut */}
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1.5">Fotos rápidas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {photoPresets.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setPhotoUrl(preset.url)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                          photoUrl === preset.url
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-700 font-bold"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: GENERAL INFO */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition-colors">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> 1. Información General
            </h3>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre de la Mascota <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Toby, Pelusa"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Especie <span className="text-red-500">*</span></label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition"
                >
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Roedor">Roedor</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Raza <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Ej: Mestizo, Siamés"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Sexo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("macho")}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold border transition ${
                      gender === "macho" ? "bg-slate-900 text-white dark:bg-indigo-600 border-slate-950 dark:border-indigo-750" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    ♂ Macho
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("hembra")}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold border transition ${
                      gender === "hembra" ? "bg-slate-900 text-white dark:bg-indigo-600 border-slate-950 dark:border-indigo-750" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    ♀ Hembra
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fecha de Nacimiento</label>
                  {birthDate && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      Edad: {calculateAge(birthDate)}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Peso (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ej: 14.5"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Color Predominante</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Ej: Negro y chocolate"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Número de Microchip (Opcional)</label>
                <input
                  type="text"
                  value={microchipNumber}
                  onChange={(e) => setMicrochipNumber(e.target.value)}
                  placeholder="Ej: 981022..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-mono text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Estado de Seguridad</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "casa" | "perdido")}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    status === "perdido" 
                      ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-900/60" 
                      : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60"
                  }`}
                >
                  <option value="casa">🟢 En Casa (Seguro)</option>
                  <option value="perdido">🔴 Perdido (¡Alerta Activa!)</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Descripción o Comportamiento</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Es asustadizo, no le gustan las bocinas de autos. Si lo encuentras ofrécele un dulce y se acercará."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 h-24 resize-none"
              />
            </div>
          </div>

          {/* SECTION 2: MEDICAL INFO */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition-colors">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base mb-6 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" /> 2. Ficha Médica de Emergencia
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Alergias graves</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Ej: Alergia al pollo, intolerante al gluten de trigo"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Medicación importante</label>
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  placeholder="Ej: Requiere dosis diaria de insulina"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Enfermedades crónicas</label>
                <input
                  type="text"
                  value={illnesses}
                  onChange={(e) => setIllnesses(e.target.value)}
                  placeholder="Ej: Cardiopatía leve, artrosis"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre de Veterinario o Clínica</label>
                <input
                  type="text"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                  placeholder="Ej: Clínica San Martín - Tel: 341-1234..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Observaciones médicas adicionales</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ej: Tiene una cirugía programada el mes que viene. Le cuesta saltar debido a una lesión de cadera."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 h-24 resize-none"
              />
            </div>
          </div>

          {/* SECTION 3: OWNER CONTACT */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition-colors">
            <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base mb-2 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> 3. Información del Propietario
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Esta información solo será visible para las personas que escaneen el collar QR de la mascota.</p>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre de Contacto <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ej: Carlos Sánchez"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Teléfono Directo de Llamada</label>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="Ej: +54 9 341 123-4567"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">WhatsApp (Número internacional, sin símbolos)</label>
                <input
                  type="text"
                  value={ownerWhatsapp}
                  onChange={(e) => setOwnerWhatsapp(e.target.value)}
                  placeholder="Ej: 5493411234567"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-mono text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-600 transition"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Ingresa código país seguido del número completo.</span>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico de Notificaciones</label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 dark:focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Ciudad de Residencia <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={ownerCity}
                  onChange={(e) => setOwnerCity(e.target.value)}
                  placeholder="Ej: Rosario, Santa Fe"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Dirección o Punto de Referencia (Opcional)</label>
                <input
                  type="text"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  placeholder="Ej: Av. Pellegrini al 1200"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-550 dark:focus:border-indigo-600 transition"
                />
              </div>
            </div>
          </div>

          {/* EMERGENCY DISCLAIMER FOR LOSS MODE */}
          {status === "perdido" && (
            <div className="rounded-3xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20 p-6 flex gap-4 items-start transition-colors">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-bold text-sm text-red-900 dark:text-red-200">🚨 Modo de Alerta Activo</h4>
                <p className="text-xs leading-relaxed text-red-700 dark:text-red-300 mt-1">
                  Has marcado esta mascota como <strong>"Perdida"</strong>. Al guardar este formulario, cualquier persona que escanee el código QR accederá inmediatamente a una página de emergencia resaltada en rojo. Tendrán accesos directos para llamarte o mandarte WhatsApp con un solo clic, y se les pedirá compartir su ubicación por GPS.
                </p>
              </div>
            </div>
          )}

          {/* ACTION BUTTON BAR */}
          <div className="flex gap-4">
            <Link
              to="/dashboard"
              className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-700 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-display font-bold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> {isEditMode ? "Guardar Modificaciones" : "Registrar Mascota"}
                </>
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
