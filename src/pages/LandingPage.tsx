import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import {
  QrCode,
  Shield,
  Heart,
  MapPin,
  MessageSquare,
  Bell,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Plus,
  Smartphone,
  Coffee,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function LandingPage() {
  const { user, logout, darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Smooth scroll handler that respects the sticky header height
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    // Timeout allows the mobile drawer to close/collapse slightly before scroll calculations occur
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const yOffset = -85; // height of the sticky header plus safety spacing
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 50);
  };

  const steps = [
    {
      num: "01",
      title: "Registra a tu Mascota",
      desc: "Completa sus datos de salud, alergias, observaciones especiales y tu información de contacto preferida.",
      icon: <Heart className="h-6 w-6 text-emerald-500" />
    },
    {
      num: "02",
      title: "Genera e Imprime el QR",
      desc: "Descarga el código QR de alta resolución que creamos automáticamente. Es permanente y nunca vence.",
      icon: <QrCode className="h-6 w-6 text-amber-500" />
    },
    {
      num: "03",
      title: "Recupera en Caso de Pérdida",
      desc: "Si alguien escanea el collar, te llegará un correo y una alerta en vivo con la ubicación GPS exacta del hallazgo.",
      icon: <MapPin className="h-6 w-6 text-red-500" />
    }
  ];

  const benefits = [
    {
      title: "Notificaciones Instantáneas",
      desc: "Recibe correos electrónicos detallados y alertas en tiempo real en tu celular en el momento exacto en que se escanee el QR.",
      icon: <Bell className="h-10 w-10 text-amber-500" />
    },
    {
      title: "GPS de Alta Precisión",
      desc: "Cuando un rescatista escanea la chapa, puede compartir su ubicación satelital exacta con solo presionar un botón.",
      icon: <MapPin className="h-10 w-10 text-emerald-500" />
    },
    {
      title: "Privacidad Controlada",
      desc: "Tú decides exactamente qué información hacer pública en cada momento. Puedes cambiar el estado a 'Perdido' al instante.",
      icon: <Shield className="h-10 w-10 text-blue-500" />
    }
  ];

  const faqs = [
    {
      q: "¿El código QR vence o tiene costos mensuales?",
      a: "No. El código QR básico generado en PetLink QR es 100% gratuito y permanente. Una vez impreso y colgado en el collar, nunca vencerá y siempre apuntará al perfil de tu mascota."
    },
    {
      q: "¿Cómo funciona el rastreo GPS?",
      a: "El código QR en sí no contiene un transmisor satelital (GPS pasivo). Cuando una persona escanea el código con su teléfono, la aplicación le solicita permiso para compartir su ubicación. Si acepta, sus coordenadas exactas son enviadas instantáneamente al dueño."
    },
    {
      q: "¿Qué pasa si no tengo una impresora?",
      a: "Puedes descargar la imagen del QR y enviarla a cualquier papelería o tienda de grabado. También puedes guardarla en tu teléfono o mandarla a imprimir en llaveros, placas metálicas o collares sublimados."
    },
    {
      q: "¿Puedo registrar más de una mascota?",
      a: "¡Sí, por supuesto! Puedes registrar todas las mascotas que tengas en tu hogar desde la misma cuenta de usuario de forma centralizada."
    }
  ];

  const reviews = [
    {
      name: "Mariana Silva",
      role: "Dueña de Rocky (Golden Retriever)",
      text: "¡A Rocky lo encontramos en menos de dos horas gracias al QR! Quien lo vio en la plaza escaneó su placa, me mandó la ubicación exacta y pude ir a buscarlo de inmediato. Recomiendo PetLink al 100%.",
      rating: 5,
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      name: "Esteban Rossi",
      role: "Dueño de Olivia (Gata Siamés)",
      text: "Me daba mucho miedo que Olivia escapara. Con el collar QR tengo una tranquilidad enorme. El sistema me notificó de inmediato cuando hice la prueba de escaneo. El mapa funciona fantástico.",
      rating: 5,
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/85 transition-colors duration-300 relative">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PetLink<span className="text-indigo-600">QR</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#como-funciona" onClick={(e) => scrollToSection(e, "como-funciona")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">¿Cómo funciona?</a>
            <a href="#beneficios" onClick={(e) => scrollToSection(e, "beneficios")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Beneficios</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, "faq")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-slate-900 dark:bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 dark:hover:bg-indigo-500 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out"
                >
                  Mi Panel
                </Link>
                <button
                  onClick={logout}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out dark:text-slate-300"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out"
                >
                  Crear mi QR
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-6 md:hidden shadow-2xl overflow-hidden"
            >
              <nav className="flex flex-col gap-4 text-base font-medium text-slate-600 dark:text-slate-300">
                <a href="#como-funciona" onClick={(e) => scrollToSection(e, "como-funciona")} className="hover:text-indigo-600 dark:hover:text-indigo-400">¿Cómo funciona?</a>
                <a href="#beneficios" onClick={(e) => scrollToSection(e, "beneficios")} className="hover:text-indigo-600 dark:hover:text-indigo-400">Beneficios</a>
                <a href="#faq" onClick={(e) => scrollToSection(e, "faq")} className="hover:text-indigo-600 dark:hover:text-indigo-400">FAQ</a>
                <button
                  onClick={() => {
                    toggleDarkMode();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  <span className="flex items-center gap-2">
                    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    Modo {darkMode ? "Claro" : "Oscuro"}
                  </span>
                </button>
                <hr className="border-slate-100 dark:border-slate-800" />
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full rounded-xl bg-slate-900 dark:bg-indigo-600 py-3 text-center font-semibold text-white shadow"
                    >
                      Mi Panel
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-3 text-center font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2 font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full rounded-xl bg-indigo-600 py-3 text-center font-semibold text-white"
                    >
                      Crear mi QR
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/10 h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/10 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl animate-pulse-slow pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-12">
            {/* Left Text */}
            <div className="md:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-800 border border-indigo-150">
                🐾 Protege lo que más amas
              </span>
              <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Su collar tiene un <br />
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  código QR único
                </span>
              </h1>
              <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
                PetLink QR te ayuda a reencontrar a tu mascota si se pierde. Genera un identificador inteligente que nunca vence, descárgalo e imprímelo en su placa. Sin suscripciones ni costes ocultos.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 px-8 py-4 font-display font-bold text-white shadow-lg hover:bg-slate-800 hover:scale-[1.03] hover:shadow-xl active:scale-[0.97] transition-all duration-300 ease-out"
                >
                  {user ? "Ir a mi Panel" : "Crear mi QR Gratuito"} <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#como-funciona"
                  onClick={(e) => scrollToSection(e, "como-funciona")}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-8 py-4 font-display font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out"
                >
                  Ver Funcionamiento
                </a>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Permanente y Gratis</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">0 Seg</div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiempo de Alerta</div>
                </div>
              </div>
            </div>

            {/* Right Graphic card */}
            <div className="md:col-span-5 flex justify-center">
              <div
                className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-all duration-300"
              >
                {/* Simulated Pet Collar badge */}
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <img
                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150"
                    alt="Toby Mascot"
                    className="h-16 w-16 rounded-2xl object-cover shadow"
                  />
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Toby</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Golden Retriever • Rosario</p>
                    <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      🟢 En Casa
                    </span>
                  </div>
                </div>

                {/* QR Display */}
                <div className="my-6 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                  <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-md border border-slate-200/60 dark:border-slate-800">
                    <QrCode className="h-40 w-40 text-slate-900 dark:text-white" />
                    <div className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                      🐾
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] font-mono text-slate-400 dark:text-slate-500">PETLINKQR.COM/PET/QR-TOBY</p>
                </div>

                {/* Emergency banner mock */}
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 p-3 text-center">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                    ⚠️ Si esta mascota se pierde, cambia su estado a "Perdido" y el QR mostrará alertas de emergencia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="como-funciona" className="py-20 bg-slate-100 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              ¿Cómo funciona PetLink QR?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Hemos diseñado el método más simple y rápido para proteger a tus mascotas y darles una voz en la calle.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, idx) => (
              <div key={idx} className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                <div className="absolute top-6 right-6 font-display text-5xl font-extrabold text-slate-100 dark:text-slate-800">
                  {step.num}
                </div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm">
                  {idx === 0 ? <Heart className="h-6 w-6 text-indigo-600" /> : idx === 1 ? <QrCode className="h-6 w-6 text-indigo-600" /> : <MapPin className="h-6 w-6 text-indigo-600" />}
                </div>
                <h3 className="mb-3 font-display text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 font-display font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              Comenzar Ahora <Plus className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Seguridad Total</span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              La tecnología al servicio del reencuentro
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Mucho más que una simple chapa con nombre. PetLink QR ofrece herramientas dinámicas ante una emergencia.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((b, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                <div className="mb-4 rounded-full bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 text-indigo-600">
                  {idx === 0 ? <Smartphone className="h-6 w-6" /> : idx === 1 ? <MapPin className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                </div>
                <h3 className="mb-3 font-display text-lg font-bold text-slate-900 dark:text-white">{b.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-100 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Preguntas Frecuentes
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              ¿Tienes alguna duda sobre el funcionamiento? Aquí tienes respuestas rápidas.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between text-left font-display font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 text-slate-400 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <QrCode className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                PetLink<span className="text-indigo-600">QR</span>
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <a href="#como-funciona" onClick={(e) => scrollToSection(e, "como-funciona")} className="hover:text-white transition">¿Cómo funciona?</a>
              <a href="#beneficios" onClick={(e) => scrollToSection(e, "beneficios")} className="hover:text-white transition">Beneficios</a>
              <a href="#faq" onClick={(e) => scrollToSection(e, "faq")} className="hover:text-white transition">FAQ</a>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-8 text-xs text-center">
            <p>© {new Date().getFullYear()} PetLink QR. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
