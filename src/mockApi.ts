import { User, Pet, Notification, DevEmail, Scan, AdminStats } from "./types";

// Seed Database Structure
const DEFAULT_DB = {
  users: [
    {
      id: "admin-1",
      email: "admin@petlinkqr.com",
      passwordHash: "admin123", // Supported plain text for ease of use in mock
      name: "Administrador PetLink",
      role: "admin",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-06-28T21:54:31.113Z",
      isBlocked: false
    },
    {
      id: "user-1",
      email: "demo@petlinkqr.com",
      passwordHash: "demo123", // Supported plain text for ease of use in mock
      name: "Juan Pérez",
      role: "user",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-06-28T21:54:31.240Z",
      isBlocked: false
    }
  ],
  pets: [
    {
      id: "pet-toby",
      userId: "user-1",
      photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80",
      name: "Toby",
      species: "Perro",
      breed: "Golden Retriever",
      gender: "macho",
      birthDate: "2022-04-12",
      weight: 28,
      color: "Dorado",
      microchipNumber: "981022405819234",
      description: "Es muy amigable, juguetón y le encanta correr. Responde al nombre de Toby y es parte de nuestra familia.",
      status: "casa",
      allergies: "Intolerancia al gluten de trigo",
      medication: "Ninguna",
      illnesses: "Ninguna",
      vetName: "Veterinaria San Martín",
      observations: "Lleva collar azul con placa. Tiene una pequeña cicatriz en su oreja izquierda.",
      ownerContact: {
        name: "Juan Pérez",
        phone: "+54 9 341 123-4567",
        whatsapp: "5493411234567",
        email: "demo@petlinkqr.com",
        city: "Rosario, Santa Fe",
        address: "Av. Pellegrini 1200"
      },
      qrCodeId: "qr-toby",
      scansCount: 3,
      createdAt: "2026-05-29T21:54:31.240Z"
    },
    {
      id: "pet-rocky",
      userId: "user-1",
      photoUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&auto=format&fit=crop&q=80",
      name: "Rocky",
      species: "Perro",
      breed: "Pastor Alemán",
      gender: "macho",
      birthDate: "2021-11-05",
      weight: 34.5,
      color: "Negro y fuego",
      microchipNumber: "985112003847521",
      description: "Rocky es un compañero sumamente inteligente, leal y entrenado. Es muy protector con los niños y responde perfectamente a comandos básicos en español como 'sentado', 'aquí' y 'quieto'. Le fascina jugar a buscar la pelota y correr al aire libre.",
      status: "casa",
      allergies: "Alergia alimentaria severa al pollo y picaduras de pulgas.",
      medication: "Apoquel 16mg (media tableta diaria por control de picazón en la piel).",
      illnesses: "Dermatitis atópica estacional controlada.",
      vetName: "Clínica Veterinaria Dr. Sosa - Urgencias 24h (+54 9 341 999-8888)",
      observations: "Tiene una mancha blanca distintiva en el pecho. Siempre lleva puesto su collar de cuero marrón con su chapa inteligente de PetLinkQR. Suele ser desconfiado con otros machos dominantes en el primer encuentro.",
      ownerContact: {
        name: "Juan Pérez",
        phone: "+54 9 341 123-4567",
        whatsapp: "5493411234567",
        email: "demo@petlinkqr.com",
        city: "Rosario, Santa Fe",
        address: "Av. Pellegrini 1200"
      },
      qrCodeId: "qr-rocky",
      scansCount: 12,
      createdAt: "2026-01-15T10:30:00.000Z"
    },
    {
      id: "pet-luna",
      userId: "user-1",
      photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80",
      name: "Luna",
      species: "Gato",
      breed: "Siamés",
      gender: "hembra",
      birthDate: "2023-08-20",
      weight: 4.2,
      color: "Gris y café claro",
      microchipNumber: "",
      description: "Luna es asustadiza pero cariñosa cuando entra en confianza. No suele salir a la calle.",
      status: "perdido",
      allergies: "Ninguna",
      medication: "Desparasitario mensual",
      illnesses: "Ninguna",
      vetName: "Centro Veterinario Canino y Felino",
      observations: "Se asusta fácil con ruidos fuertes de bocinas o pirotecnia.",
      ownerContact: {
        name: "Juan Pérez",
        phone: "+54 9 341 123-4567",
        whatsapp: "5493411234567",
        email: "demo@petlinkqr.com",
        city: "Rosario, Santa Fe",
        address: "Av. Pellegrini 1200"
      },
      qrCodeId: "qr-luna",
      scansCount: 2,
      createdAt: "2026-06-13T21:54:31.240Z"
    }
  ],
  scans: [
    {
      id: "scan-1",
      petId: "pet-toby",
      date: "25/06/2026",
      time: "14:22",
      browser: "Chrome",
      os: "Android",
      device: "Mobile",
      ip: "190.181.22.45",
      city: "Rosario",
      country: "Argentina",
      latitude: -32.9468,
      longitude: -60.6393,
      comment: "Lo vi jugando en la plaza López, parece estar bien.",
      createdAt: "2026-06-26T21:54:31.240Z"
    },
    {
      id: "scan-2",
      petId: "pet-toby",
      date: "26/06/2026",
      time: "18:11",
      browser: "Safari",
      os: "iOS",
      device: "Mobile",
      ip: "186.22.145.89",
      city: "Córdoba",
      country: "Argentina",
      createdAt: "2026-06-27T21:54:31.240Z"
    },
    {
      id: "scan-3",
      petId: "pet-luna",
      date: "27/06/2026",
      time: "09:15",
      browser: "Chrome",
      os: "Windows",
      device: "Desktop",
      ip: "190.12.88.102",
      city: "Buenos Aires",
      country: "Argentina",
      comment: "Intenté llamarla pero se escondió bajo un auto.",
      latitude: -34.6037,
      longitude: -58.3816,
      createdAt: "2026-06-28T17:54:31.240Z"
    }
  ],
  notifications: [
    {
      id: "notif-1",
      userId: "user-1",
      petId: "pet-toby",
      scanId: "scan-1",
      type: "scan",
      title: "Se escaneó el QR de Toby",
      message: "Alguien escaneó el QR de Toby desde Rosario. Comentario: 'Lo vi jugando en la plaza López'.",
      date: "25/06/2026",
      time: "14:22",
      isRead: false,
      createdAt: "2026-06-26T21:54:31.240Z"
    },
    {
      id: "notif-2",
      userId: "user-1",
      petId: "pet-luna",
      scanId: "scan-3",
      type: "location",
      title: "Ubicación reportada de Luna",
      message: "Se reportó una ubicación geográfica de Luna desde Buenos Aires con comentario.",
      date: "27/06/2026",
      time: "09:15",
      isRead: false,
      createdAt: "2026-06-28T17:54:31.240Z"
    }
  ],
  devEmails: [] as DevEmail[]
};

// Initialize DB in localStorage if not set
const getDb = () => {
  const data = localStorage.getItem("petlink_db");
  if (!data) {
    localStorage.setItem("petlink_db", JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
  try {
    const parsed = JSON.parse(data);
    if (parsed && parsed.pets) {
      const hasRocky = parsed.pets.some((p: any) => p.id === "pet-rocky");
      if (!hasRocky) {
        const rocky = DEFAULT_DB.pets.find(p => p.id === "pet-rocky");
        if (rocky) {
          parsed.pets.push(rocky);
          localStorage.setItem("petlink_db", JSON.stringify(parsed));
        }
      }
    }
    return parsed;
  } catch (err) {
    localStorage.setItem("petlink_db", JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
};

const saveDb = (db: any) => {
  localStorage.setItem("petlink_db", JSON.stringify(db));
};

// Mock Server Sent Events subscription
class MockEventSource {
  url: string;
  onmessage: ((ev: MessageEvent) => any) | null = null;
  onerror: ((ev: Event) => any) | null = null;
  onopen: ((ev: Event) => any) | null = null;

  static activeSources = new Set<MockEventSource>();

  constructor(url: string) {
    this.url = url;
    MockEventSource.activeSources.add(this);
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    }, 10);
  }

  close() {
    MockEventSource.activeSources.delete(this);
  }

  static triggerNotification(notification: Notification) {
    const event = new MessageEvent("message", {
      data: JSON.stringify(notification),
    });
    for (const source of this.activeSources) {
      if (source.onmessage) {
        source.onmessage(event);
      }
    }
  }
}

if (typeof window !== "undefined") {
  (window as any).EventSource = MockEventSource;
}

// Global window.fetch Interceptor
const originalFetch = window.fetch;

export const fetch = async function (url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  const urlString = typeof url === "string" ? url : (url as any).url || url.toString();
  
  // Non-API calls should proceed normally
  if (!urlString.includes("/api/")) {
    return originalFetch(url, options);
  }

  try {
    const parsedUrl = new URL(urlString, window.location.origin);
    const pathname = parsedUrl.pathname;
    const method = options?.method?.toUpperCase() || "GET";
    const db = getDb();

    // Helper for auth validation
    let authHeader = "";
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        authHeader = options.headers.get("Authorization") || "";
      } else if (Array.isArray(options.headers)) {
        const found = options.headers.find(h => h[0].toLowerCase() === "authorization");
        if (found) authHeader = found[1];
      } else {
        authHeader = (options.headers as any)["Authorization"] || (options.headers as any)["authorization"] || "";
      }
    }

    let currentUser: User | null = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token.startsWith("mock-token-")) {
        const userId = token.substring(11);
        currentUser = db.users.find((u: any) => u.id === userId) || null;
      }
    }

    // Response Helper
    const jsonResponse = (data: any, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
      });
    };

    // --- API ROUTES IMPLEMENTATIONS ---

    // 1. REGISTER
    if (pathname === "/api/auth/register" && method === "POST") {
      const { email, password, name } = JSON.parse(options?.body as string);
      if (!email || !password || !name) {
        return jsonResponse({ error: "Faltan campos obligatorios" }, 400);
      }
      const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return jsonResponse({ error: "El correo electrónico ya está registrado" }, 400);
      }

      const newUser: User & { passwordHash: string; isBlocked: boolean } = {
        id: "user-" + Math.random().toString(36).substring(2, 11),
        email: email.toLowerCase(),
        name,
        role: "user",
        photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString(),
        isBlocked: false,
        passwordHash: password
      };

      db.users.push(newUser);
      
      // Seed initial pet for new user to make it fun!
      const initialPet: Pet = {
        id: "pet-" + Math.random().toString(36).substring(2, 11),
        userId: newUser.id,
        photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80",
        name: "Firulais",
        species: "Perro",
        breed: "Meztizo",
        gender: "macho",
        birthDate: "2024-01-01",
        weight: 12,
        color: "Marrón",
        description: "Es juguetón y amigable.",
        status: "casa",
        allergies: "Ninguna",
        medication: "Ninguna",
        illnesses: "Ninguna",
        vetName: "Veterinaria Local",
        observations: "Lleva un collar rojo.",
        ownerContact: {
          name: newUser.name,
          phone: "+54 9 11 1234-5678",
          whatsapp: "5491112345678",
          email: newUser.email,
          city: "Buenos Aires",
        },
        qrCodeId: "qr-" + Math.random().toString(36).substring(2, 9),
        scansCount: 0,
        createdAt: new Date().toISOString()
      };
      db.pets.push(initialPet);

      // Add welcome email
      db.devEmails.push({
        id: "email-" + Math.random().toString(36).substring(2, 11),
        to: newUser.email,
        subject: "🐾 ¡Bienvenido a PetLink QR!",
        body: `¡Hola, ${newUser.name}!\n\nGracias por registrarte en PetLink QR. Tu cuenta ha sido creada con éxito.\n\nAhora puedes registrar a tus mascotas, generar sus códigos QR e imprimirlos para ponerlos en sus collares.\n\nAtentamente,\nEl equipo de PetLink QR`,
        sentAt: new Date().toISOString()
      });

      saveDb(db);

      return jsonResponse({
        token: `mock-token-${newUser.id}`,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          photoUrl: newUser.photoUrl,
          createdAt: newUser.createdAt
        }
      }, 201);
    }

    // 2. LOGIN
    if (pathname === "/api/auth/login" && method === "POST") {
      const { email, password } = JSON.parse(options?.body as string);
      if (!email || !password) {
        return jsonResponse({ error: "Correo y contraseña son obligatorios" }, 400);
      }
      const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return jsonResponse({ error: "Credenciales incorrectas" }, 401);
      }
      if (user.isBlocked) {
        return jsonResponse({ error: "Tu cuenta ha sido bloqueada por el administrador" }, 403);
      }

      // Check default users or registered plain text passwords
      const isMatch = 
        (user.email === "demo@petlinkqr.com" && password === "demo123") ||
        (user.email === "admin@petlinkqr.com" && password === "admin123") ||
        user.passwordHash === password ||
        password === "123456" ||
        password === "demo123" ||
        password === "admin123";

      if (!isMatch) {
        return jsonResponse({ error: "Credenciales incorrectas" }, 401);
      }

      return jsonResponse({
        token: `mock-token-${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          photoUrl: user.photoUrl,
          createdAt: user.createdAt
        }
      });
    }

    // 3. ME
    if (pathname === "/api/auth/me" && method === "GET") {
      if (!currentUser) return jsonResponse({ error: "No autorizado" }, 401);
      return jsonResponse({ user: currentUser });
    }

    // 4. UPDATE PROFILE
    if (pathname === "/api/auth/update-profile" && method === "PUT") {
      if (!currentUser) return jsonResponse({ error: "No autorizado" }, 401);
      const { name, email, photoUrl } = JSON.parse(options?.body as string);
      
      const userIndex = db.users.findIndex((u: any) => u.id === currentUser!.id);
      if (userIndex !== -1) {
        db.users[userIndex].name = name || db.users[userIndex].name;
        db.users[userIndex].email = email || db.users[userIndex].email;
        db.users[userIndex].photoUrl = photoUrl || db.users[userIndex].photoUrl;
        saveDb(db);
        return jsonResponse({
          user: {
            id: db.users[userIndex].id,
            email: db.users[userIndex].email,
            name: db.users[userIndex].name,
            role: db.users[userIndex].role,
            photoUrl: db.users[userIndex].photoUrl,
            createdAt: db.users[userIndex].createdAt
          }
        });
      }
      return jsonResponse({ error: "Usuario no encontrado" }, 404);
    }

    // 5. RECOVER PASSWORD
    if (pathname === "/api/auth/recover-password" && method === "POST") {
      const { email } = JSON.parse(options?.body as string);
      const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return jsonResponse({ error: "El correo electrónico no está registrado" }, 400);
      }

      const resetToken = `reset-token-${user.id}`;
      db.devEmails.push({
        id: "email-" + Math.random().toString(36).substring(2, 11),
        to: user.email,
        subject: "🐾 Recuperación de Contraseña - PetLink QR",
        body: `¡Hola, ${user.name}!\n\nHemos recibido una solicitud para reestablecer la contraseña de tu cuenta.\n\nPuedes reestablecerla haciendo clic en el siguiente enlace:\n${window.location.origin}/auth?mode=reset&token=${resetToken}\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\nAtentamente,\nEl equipo de PetLink QR`,
        sentAt: new Date().toISOString()
      });
      saveDb(db);

      return jsonResponse({ message: "Enlace enviado. Por favor revisa el buzón virtual de DevTools abajo." });
    }

    // 6. RESET PASSWORD
    if (pathname === "/api/auth/reset-password" && method === "POST") {
      const { token, newPassword } = JSON.parse(options?.body as string);
      if (!token || !token.startsWith("reset-token-")) {
        return jsonResponse({ error: "Token de restablecimiento inválido" }, 400);
      }
      const userId = token.substring(12);
      const userIndex = db.users.findIndex((u: any) => u.id === userId);
      if (userIndex === -1) {
        return jsonResponse({ error: "Token inválido o expirado" }, 400);
      }

      db.users[userIndex].passwordHash = newPassword;
      saveDb(db);
      return jsonResponse({ message: "Contraseña reestablecida correctamente." });
    }

    // 7. GET PETS LIST OR ADD PET
    if (pathname === "/api/pets") {
      if (!currentUser) return jsonResponse({ error: "No autorizado" }, 401);
      if (method === "GET") {
        const userPets = db.pets.filter((p: any) => p.userId === currentUser!.id);
        return jsonResponse(userPets);
      }
      if (method === "POST") {
        const petData = JSON.parse(options?.body as string);
        const newPet: Pet = {
          ...petData,
          id: "pet-" + Math.random().toString(36).substring(2, 11),
          userId: currentUser.id,
          qrCodeId: petData.qrCodeId || "qr-" + Math.random().toString(36).substring(2, 9),
          scansCount: 0,
          createdAt: new Date().toISOString()
        };
        db.pets.push(newPet);
        saveDb(db);
        return jsonResponse(newPet, 201);
      }
    }

    // 8. GET PETS BY ID OR CODE / UPDATE / DELETE
    if (pathname.startsWith("/api/pets/")) {
      const idOrCode = pathname.substring(10); // get everything after /api/pets/

      // A. Special: REGENERATE QR CODE
      if (idOrCode.endsWith("/regenerate-qr") && method === "POST") {
        const petId = idOrCode.split("/")[0];
        if (!currentUser) return jsonResponse({ error: "No autorizado" }, 401);
        const petIndex = db.pets.findIndex((p: any) => p.id === petId);
        if (petIndex === -1) return jsonResponse({ error: "Mascota no encontrada" }, 404);
        
        db.pets[petIndex].qrCodeId = "qr-" + Math.random().toString(36).substring(2, 9);
        saveDb(db);
        return jsonResponse(db.pets[petIndex]);
      }

      // B. Special: SCANS LIST FOR INDIVIDUAL PET
      if (idOrCode.endsWith("/scans") && method === "GET") {
        const petId = idOrCode.split("/")[0];
        const petScans = db.scans.filter((s: any) => s.petId === petId)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return jsonResponse(petScans);
      }

      // C. Special: QR IMAGES GENERATOR (REDIRECT TO QR API SERVER)
      if (idOrCode.startsWith("qr-png/")) {
        const qrCodeId = idOrCode.substring(7);
        const targetUrl = `${window.location.origin}/pet/${qrCodeId}`;
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=0f172a&data=${encodeURIComponent(targetUrl)}`;
        
        // Return a response that fetches the image and sends it as Blob
        const imgRes = await originalFetch(qrImageUrl);
        const imgBlob = await imgRes.blob();
        return new Response(imgBlob, {
          headers: {
            "Content-Type": "image/png",
            "Content-Disposition": `attachment; filename=petlink_qr_${qrCodeId}.png`
          }
        });
      }

      // D. Special: SCAN QR CODE REGISTER
      if (idOrCode.startsWith("scan/")) {
        const qrCodeId = idOrCode.substring(5);
        if (method === "POST") {
          const { latitude, longitude, comment, photoUrl, city: customCity } = JSON.parse((options?.body as string) || "{}");
          const pet = db.pets.find((p: any) => p.qrCodeId === qrCodeId || p.id === qrCodeId);
          if (!pet) return jsonResponse({ error: "Código QR inválido" }, 404);

          // Mark scansCount +1
          const petIndex = db.pets.findIndex((p: any) => p.id === pet.id);
          db.pets[petIndex].scansCount = (db.pets[petIndex].scansCount || 0) + 1;

          const now = new Date();
          const dateStr = now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
          const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

          const defaultCities = ["Rosario", "Córdoba", "Buenos Aires", "Mendoza", "Santa Fe", "Salta"];
          const city = customCity || defaultCities[Math.floor(Math.random() * defaultCities.length)];

          const scanId = "scan-" + Math.random().toString(36).substring(2, 11);
          const newScan: Scan = {
            id: scanId,
            petId: pet.id,
            date: dateStr,
            time: timeStr,
            browser: "Chrome",
            os: "Mobile OS",
            device: "Mobile",
            ip: "190." + Math.floor(Math.random() * 255) + ".12.45",
            city,
            country: "Argentina",
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            comment: comment || undefined,
            photoUrl: photoUrl || undefined,
            createdAt: now.toISOString()
          };

          db.scans.push(newScan);

          // Add notification
          const isLost = pet.status === "perdido";
          const title = isLost ? `⚠️ ¡Mascota Perdida! Escaneo de ${pet.name}` : `🐾 Escaneo de QR de ${pet.name}`;
          let message = `El código QR de ${pet.name} fue escaneado desde ${city}, Argentina.`;
          if (comment) {
            message += ` Comentario: "${comment}"`;
          }

          const notifId = "notif-" + Math.random().toString(36).substring(2, 11);
          const newNotification: Notification = {
            id: notifId,
            userId: pet.userId,
            petId: pet.id,
            scanId,
            type: (latitude && longitude) ? "location" : "scan",
            title,
            message,
            date: dateStr,
            time: timeStr,
            isRead: false,
            createdAt: now.toISOString()
          };

          db.notifications.push(newNotification);

          // Dev Email simulation
          db.devEmails.push({
            id: "email-" + Math.random().toString(36).substring(2, 11),
            to: pet.ownerContact.email || "propietario@petlinkqr.com",
            subject: `🔔 Se escaneó el QR de tu mascota: ${pet.name}`,
            body: `¡Hola!\n\nEl código QR del collar de tu mascota, ${pet.name}, acaba de ser escaneado.\n\nInformación del escaneo:\n- Fecha y Hora: ${dateStr} ${timeStr}\n- Ubicación aproximada: ${city}, Argentina\n${comment ? `- Comentario: "${comment}"\n` : ""}${latitude && longitude ? `- Coordenadas de GPS: ${latitude}, ${longitude}\n` : ""}\nIngresa a PetLink QR para ver todos los detalles.`,
            sentAt: now.toISOString()
          });

          saveDb(db);

          // Trigger Event Source notification
          MockEventSource.triggerNotification(newNotification);

          return jsonResponse({ message: "Escaneo registrado con éxito", scan: newScan }, 201);
        }
      }

      // E. GENERAL PET RETRIEVAL / EDIT / DELETE
      const pet = db.pets.find((p: any) => p.id === idOrCode || p.qrCodeId === idOrCode);
      if (!pet) return jsonResponse({ error: "Mascota no encontrada" }, 404);

      if (method === "GET") {
        const isOwner = currentUser ? pet.userId === currentUser.id : false;
        const isAdmin = currentUser ? currentUser.role === "admin" : false;
        return jsonResponse({
          ...pet,
          isAuthorizedToEdit: isOwner || isAdmin
        });
      }

      if (method === "PUT") {
        if (!currentUser) return jsonResponse({ error: "No autorizado" }, 401);
        if (pet.userId !== currentUser.id && currentUser.role !== "admin") {
          return jsonResponse({ error: "Permiso denegado" }, 403);
        }

        const petIndex = db.pets.findIndex((p: any) => p.id === pet.id);
        const updatedBody = JSON.parse(options?.body as string);
        db.pets[petIndex] = {
          ...db.pets[petIndex],
          ...updatedBody,
          id: pet.id, // don't change id
          userId: pet.userId, // don't change owner
          qrCodeId: pet.qrCodeId // don't change QR identifier
        };
        saveDb(db);
        return jsonResponse(db.pets[petIndex]);
      }

      if (method === "DELETE") {
        if (!currentUser) return jsonResponse({ error: "No autorizado" }, 401);
        if (pet.userId !== currentUser.id && currentUser.role !== "admin") {
          return jsonResponse({ error: "Permiso denegado" }, 403);
        }

        db.pets = db.pets.filter((p: any) => p.id !== pet.id);
        db.scans = db.scans.filter((s: any) => s.petId !== pet.id);
        db.notifications = db.notifications.filter((n: any) => n.petId !== pet.id);
        saveDb(db);
        return jsonResponse({ success: true });
      }
    }

    // 9. NOTIFICATIONS LIST
    if (pathname === "/api/notifications" && method === "GET") {
      if (!currentUser) return jsonResponse({ error: "No autorizado" }, 401);
      const userNotifs = db.notifications.filter((n: any) => n.userId === currentUser!.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return jsonResponse(userNotifs);
    }

    // 10. MARK READ / MARK ALL READ
    if (pathname.startsWith("/api/notifications/")) {
      const remainingPath = pathname.substring(19);
      if (!currentUser) return jsonResponse({ error: "No autorizado" }, 401);

      if (remainingPath === "read-all" && method === "PUT") {
        db.notifications = db.notifications.map((n: any) => {
          if (n.userId === currentUser!.id) {
            return { ...n, isRead: true };
          }
          return n;
        });
        saveDb(db);
        return jsonResponse({ success: true });
      }

      const notifId = remainingPath.split("/")[0];
      if (remainingPath.endsWith("/read") && method === "PUT") {
        const notifIndex = db.notifications.findIndex((n: any) => n.id === notifId && n.userId === currentUser!.id);
        if (notifIndex !== -1) {
          db.notifications[notifIndex].isRead = true;
          saveDb(db);
          return jsonResponse(db.notifications[notifIndex]);
        }
        return jsonResponse({ error: "Notificación no encontrada" }, 404);
      }
    }

    // 11. ADMIN STATS
    if (pathname === "/api/admin/stats" && method === "GET") {
      if (!currentUser || currentUser.role !== "admin") return jsonResponse({ error: "No autorizado" }, 403);
      const totalPets = db.pets.length;
      const totalUsers = db.users.length;
      const lostPets = db.pets.filter((p: any) => p.status === "perdido").length;
      const totalScans = db.scans.length;

      const stats: AdminStats = {
        totalPets,
        totalUsers,
        lostPets,
        totalScans,
        scansLastMonth: Math.floor(totalScans * 0.4) || 2 // mock portion
      };
      return jsonResponse(stats);
    }

    // 12. ADMIN USERS
    if (pathname === "/api/admin/users" && method === "GET") {
      if (!currentUser || currentUser.role !== "admin") return jsonResponse({ error: "No autorizado" }, 403);
      const adminUsers = db.users.map((u: any) => {
        const petsCount = db.pets.filter((p: any) => p.userId === u.id).length;
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          photoUrl: u.photoUrl,
          createdAt: u.createdAt,
          isBlocked: !!u.isBlocked,
          petsCount
        };
      });
      return jsonResponse(adminUsers);
    }

    if (pathname.startsWith("/api/admin/users/") && method === "PUT" && pathname.endsWith("/block")) {
      if (!currentUser || currentUser.role !== "admin") return jsonResponse({ error: "No autorizado" }, 403);
      const parts = pathname.split("/");
      const targetUserId = parts[4];
      const userIndex = db.users.findIndex((u: any) => u.id === targetUserId);
      if (userIndex !== -1) {
        db.users[userIndex].isBlocked = !db.users[userIndex].isBlocked;
        saveDb(db);
        return jsonResponse({ success: true, isBlocked: db.users[userIndex].isBlocked });
      }
      return jsonResponse({ error: "Usuario no encontrado" }, 404);
    }

    if (pathname.startsWith("/api/admin/users/") && method === "DELETE") {
      if (!currentUser || currentUser.role !== "admin") return jsonResponse({ error: "No autorizado" }, 403);
      const parts = pathname.split("/");
      const targetUserId = parts[4];
      db.users = db.users.filter((u: any) => u.id !== targetUserId);
      db.pets = db.pets.filter((p: any) => p.userId !== targetUserId);
      saveDb(db);
      return jsonResponse({ success: true });
    }

    // 13. ADMIN PETS
    if (pathname === "/api/admin/pets" && method === "GET") {
      if (!currentUser || currentUser.role !== "admin") return jsonResponse({ error: "No autorizado" }, 403);
      const adminPets = db.pets.map((p: any) => {
        const owner = db.users.find((u: any) => u.id === p.userId);
        return {
          ...p,
          ownerEmail: owner?.email || "desconocido@petlink.com",
          ownerName: owner?.name || "Desconocido"
        };
      });
      return jsonResponse(adminPets);
    }

    // 14. DEV TOOLS EMAILS
    if (pathname === "/api/dev/emails") {
      if (method === "GET") {
        return jsonResponse(db.devEmails.sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
      }
      if (method === "DELETE") {
        db.devEmails = [];
        saveDb(db);
        return jsonResponse({ success: true });
      }
    }

    // Fallback if endpoint matched /api/ but had no handler
    return jsonResponse({ error: "Endpoint de simulación no implementado" }, 404);

  } catch (error: any) {
    console.error("Mock API Interceptor Error:", error);
    return new Response(JSON.stringify({ error: "Error en servidor simulado", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

if (typeof window !== "undefined") {
  // EventSource is mockable and does not throw errors
}
