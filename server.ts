import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import qrCode from "qrcode";
import { dbStore, User, Pet, Scan, Notification, PetContact } from "./server/dbStore";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "petlink_secret_key_2026_super_safe";

// Parse JSON and URL encoded bodies
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to extract device metadata from user agent
function parseUserAgent(uaString: string | undefined): { browser: string; os: string; device: string } {
  if (!uaString) {
    return { browser: "Desconocido", os: "Desconocido", device: "Desktop" };
  }
  
  let os = "Desconocido";
  let browser = "Desconocido";
  let device = "Desktop";

  const lower = uaString.toLowerCase();

  // Device type
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(uaString)) {
    device = "Tablet";
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(uaString)) {
    device = "Mobile";
  }

  // OS
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone") || lower.includes("ipad") || lower.includes("ipod")) os = "iOS";
  else if (lower.includes("macintosh") || lower.includes("mac os")) os = "macOS";
  else if (lower.includes("linux")) os = "Linux";

  // Browser
  if (lower.includes("chrome") || lower.includes("crios")) browser = "Chrome";
  else if (lower.includes("safari") && !lower.includes("chrome") && !lower.includes("chromium")) browser = "Safari";
  else if (lower.includes("firefox") || lower.includes("fxios")) browser = "Firefox";
  else if (lower.includes("edge") || lower.includes("edg")) browser = "Edge";
  else if (lower.includes("opr") || lower.includes("opera")) browser = "Opera";

  return { browser, os, device };
}

// SSE Connection Hub for Live notifications
const sseClients = new Map<string, express.Response[]>();

function sendLiveNotification(userId: string, notification: Notification) {
  const clients = sseClients.get(userId);
  if (clients && clients.length > 0) {
    clients.forEach((res) => {
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
    });
  }
}

// JWT Authentication Middleware
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    role: "admin" | "user";
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Acceso no autorizado, token faltante" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: "Token inválido o expirado" });
      return;
    }
    
    req.user = decoded as { id: string; email: string; role: "admin" | "user" };
    next();
  });
};

// Admin authentication middleware
const requireAdmin = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Permiso denegado, se requiere rol de administrador" });
    return;
  }
  next();
};

/* ==========================================================================
   API ROUTES - AUTH
   ========================================================================== */

// Register a new user
app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: "Faltan campos obligatorios" });
    return;
  }

  const existingUser = dbStore.getUserByEmail(email);
  if (existingUser) {
    res.status(400).json({ error: "El correo electrónico ya está registrado" });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: User = {
    id: "user-" + Math.random().toString(36).substring(2, 11),
    email: email.toLowerCase(),
    passwordHash,
    name,
    role: "user",
    photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString(),
    isBlocked: false,
  };

  dbStore.addUser(newUser);

  // Send registration confirmation email (Simulated)
  dbStore.addDevEmail({
    to: newUser.email,
    subject: "🐾 ¡Bienvenido a PetLink QR!",
    body: `¡Hola, ${newUser.name}!\n\nGracias por registrarte en PetLink QR. Tu cuenta ha sido creada con éxito.\n\nAhora puedes registrar a tus mascotas, generar sus códigos QR e imprimirlos para ponerlos en sus collares.\n\nAtentamente,\nEl equipo de PetLink QR`,
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      photoUrl: newUser.photoUrl,
      createdAt: newUser.createdAt,
    },
  });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    return;
  }

  const user = dbStore.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }

  if (user.isBlocked) {
    res.status(403).json({ error: "Tu cuenta ha sido bloqueada por el administrador" });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
    },
  });
});

// Get current profile
app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const user = dbStore.getUserById(userId);

  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    photoUrl: user.photoUrl,
    createdAt: user.createdAt,
  });
});

// Update profile details
app.put("/api/auth/update-profile", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { name, photoUrl } = req.body;

  if (!name) {
    res.status(400).json({ error: "El nombre es obligatorio" });
    return;
  }

  const updatedUser = dbStore.updateUser(userId, { name, photoUrl });
  if (!updatedUser) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  res.json({
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    photoUrl: updatedUser.photoUrl,
    createdAt: updatedUser.createdAt,
  });
});

// Change Password
app.put("/api/auth/change-password", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Ambas contraseñas son obligatorias" });
    return;
  }

  const user = dbStore.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isMatch) {
    res.status(400).json({ error: "La contraseña actual es incorrecta" });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  dbStore.updateUser(userId, { passwordHash });

  res.json({ message: "Contraseña actualizada exitosamente" });
});

// Password recovery via simulated email
app.post("/api/auth/recover-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "El correo electrónico es obligatorio" });
    return;
  }

  const user = dbStore.getUserByEmail(email);
  if (!user) {
    // Return success anyway for security reasons, but don't record email
    res.json({ message: "Si el correo está registrado, recibirás un enlace de recuperación pronto" });
    return;
  }

  // Generate a mock reset token
  const resetToken = jwt.sign(
    { id: user.id, action: "reset_password" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const resetLink = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;

  dbStore.addDevEmail({
    to: user.email,
    subject: "🔑 Recuperación de contraseña - PetLink QR",
    body: `Hola, ${user.name}.\n\nHas solicitado restablecer tu contraseña para tu cuenta de PetLink QR.\n\nPara completar esta solicitud, haz clic en el siguiente enlace o cópialo en tu navegador:\n\n${resetLink}\n\nEste enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.\n\nAtentamente,\nSoporte de PetLink QR`,
  });

  res.json({ message: "Se ha enviado un enlace de recuperación a tu correo electrónico" });
});

// Reset Password
app.post("/api/auth/reset-password", (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ error: "El token y la nueva contraseña son requeridos" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; action: string };
    if (decoded.action !== "reset_password") {
      res.status(400).json({ error: "Token de acción inválido" });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    const user = dbStore.updateUser(decoded.id, { passwordHash });
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json({ message: "Contraseña reestablecida correctamente. Ya puedes iniciar sesión." });
  } catch (err) {
    res.status(400).json({ error: "El enlace de recuperación es inválido o ha expirado" });
  }
});

/* ==========================================================================
   API ROUTES - PETS (PRIVATE & PUBLIC)
   ========================================================================== */

// Get all pets for logged in user
app.get("/api/pets", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  // If admin, can see all, else only own
  if (userRole === "admin") {
    res.json(dbStore.getPets());
  } else {
    res.json(dbStore.getPetsByUserId(userId));
  }
});

// Create a pet
app.post("/api/pets", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const petData = req.body;

  if (!petData.name || !petData.species || !petData.breed) {
    res.status(400).json({ error: "Faltan campos obligatorios para registrar la mascota" });
    return;
  }

  const petId = "pet-" + Math.random().toString(36).substring(2, 11);
  const qrCodeId = "qr-" + Math.random().toString(36).substring(2, 11);

  const newPet: Pet = {
    id: petId,
    userId,
    photoUrl: petData.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80",
    name: petData.name,
    species: petData.species,
    breed: petData.breed,
    gender: petData.gender || "macho",
    birthDate: petData.birthDate || "",
    weight: Number(petData.weight) || 0,
    color: petData.color || "",
    microchipNumber: petData.microchipNumber || "",
    description: petData.description || "",
    status: petData.status || "casa",
    allergies: petData.allergies || "",
    medication: petData.medication || "",
    illnesses: petData.illnesses || "",
    vetName: petData.vetName || "",
    observations: petData.observations || "",
    ownerContact: {
      name: petData.ownerContact?.name || req.user?.email || "Propietario",
      phone: petData.ownerContact?.phone || "",
      whatsapp: petData.ownerContact?.whatsapp || "",
      email: petData.ownerContact?.email || req.user?.email || "",
      city: petData.ownerContact?.city || "",
      address: petData.ownerContact?.address || "",
    },
    qrCodeId,
    scansCount: 0,
    createdAt: new Date().toISOString(),
  };

  dbStore.addPet(newPet);
  res.status(201).json(newPet);
});

// Get a pet (Check ownership, but public profiles are readable)
app.get("/api/pets/:id", (req, res) => {
  const petId = req.params.id;
  const pet = dbStore.getPetById(petId) || dbStore.getPetByQrCodeId(petId);

  if (!pet) {
    res.status(404).json({ error: "Mascota no encontrada" });
    return;
  }

  // Check authorization headers if they are passed, to decide private vs public return
  const authHeader = req.headers["authorization"];
  let isOwner = false;
  let isAdmin = false;

  if (authHeader && authHeader.split(" ")[1]) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      isOwner = pet.userId === decoded.id;
      isAdmin = decoded.role === "admin";
    } catch (e) {
      // Ignored
    }
  }

  // Return public or full data (For this app, most of pet data is visible anyway, but owner contacts are filtered if private)
  res.json({
    ...pet,
    isAuthorizedToEdit: isOwner || isAdmin,
  });
});

// Update a pet
app.put("/api/pets/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const petId = req.params.id;

  const pet = dbStore.getPetById(petId);
  if (!pet) {
    res.status(404).json({ error: "Mascota no encontrada" });
    return;
  }

  if (pet.userId !== userId && userRole !== "admin") {
    res.status(403).json({ error: "No tienes permiso para editar esta mascota" });
    return;
  }

  const updates = req.body;
  const updatedPet = dbStore.updatePet(petId, updates);

  res.json(updatedPet);
});

// Delete a pet
app.delete("/api/pets/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const petId = req.params.id;

  const pet = dbStore.getPetById(petId);
  if (!pet) {
    res.status(404).json({ error: "Mascota no encontrada" });
    return;
  }

  if (pet.userId !== userId && userRole !== "admin") {
    res.status(403).json({ error: "No tienes permiso para eliminar esta mascota" });
    return;
  }

  dbStore.deletePet(petId);
  res.json({ message: "Mascota eliminada correctamente" });
});

// Regenerate QR Code for a pet
app.post("/api/pets/:id/regenerate-qr", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const petId = req.params.id;

  const pet = dbStore.getPetById(petId);
  if (!pet) {
    res.status(404).json({ error: "Mascota no encontrada" });
    return;
  }

  if (pet.userId !== userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "No tienes permiso para esta acción" });
    return;
  }

  const newQrCodeId = "qr-" + Math.random().toString(36).substring(2, 11);
  dbStore.updatePet(petId, { qrCodeId: newQrCodeId });

  res.json({ message: "Código QR regenerado con éxito", qrCodeId: newQrCodeId });
});

/* ==========================================================================
   API ROUTES - QR CODE PNG/SVG STREAMING
   ========================================================================== */

// Streaming PNG high-res QR Code
app.get("/api/pets/qr-png/:qrCodeId", async (req, res) => {
  const qrCodeId = req.params.qrCodeId;
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const targetUrl = `${appUrl}/pet/${qrCodeId}`;

  try {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename=petlink_qr_${qrCodeId}.png`);
    
    // Generate QR code directly as PNG stream/buffer
    const qrBuffer = await qrCode.toBuffer(targetUrl, {
      type: "png",
      width: 600,
      margin: 1,
      color: {
        dark: "#0F172A", // Slate-900 (deep dark blue)
        light: "#FFFFFF",
      },
    });

    res.send(qrBuffer);
  } catch (err) {
    res.status(500).json({ error: "Error al generar imagen del código QR" });
  }
});

// Streaming SVG QR Code
app.get("/api/pets/qr-svg/:qrCodeId", async (req, res) => {
  const qrCodeId = req.params.qrCodeId;
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const targetUrl = `${appUrl}/pet/${qrCodeId}`;

  try {
    res.setHeader("Content-Type", "image/svg+xml");
    
    const qrSvg = await qrCode.toString(targetUrl, {
      type: "svg",
      margin: 1,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    res.send(qrSvg);
  } catch (err) {
    res.status(500).json({ error: "Error al generar vector del código QR" });
  }
});

/* ==========================================================================
   API ROUTES - SCAN TRIGGER & LOGGING
   ========================================================================== */

// Record a QR scan
app.post("/api/pets/scan/:qrCodeId", (req, res) => {
  const qrCodeId = req.params.qrCodeId;
  const { latitude, longitude, comment, photoUrl } = req.body;

  const pet = dbStore.getPetByQrCodeId(qrCodeId);
  if (!pet) {
    res.status(404).json({ error: "Código QR inválido" });
    return;
  }

  // ONLY pets marked as 'perdido' can be scanned
  if (pet.status !== "perdido") {
    res.status(403).json({ error: "El código QR no está activo. La mascota se encuentra segura en su hogar." });
    return;
  }

  // Find most recent scan for this pet to see if we can coalesce it (5-minute window)
  const scans = dbStore.getScansByPetId(pet.id);
  const recentScan = scans[0];
  const now = new Date();
  const isWithinWindow = recentScan && (now.getTime() - new Date(recentScan.createdAt).getTime() < 300000);

  const dateStr = now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  const userAgentHeader = req.headers["user-agent"];
  const { browser, os, device } = parseUserAgent(userAgentHeader);
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1") as string;

  let city = req.body.city || "Rosario";
  let country = req.body.country || "Argentina";
  if (!req.body.city) {
    const defaultCities = ["Rosario", "Córdoba", "Buenos Aires", "Mendoza", "Santa Fe", "Salta"];
    city = defaultCities[Math.floor(Math.random() * defaultCities.length)];
  }

  if (isWithinWindow && recentScan) {
    const isAutomatic = !latitude && !longitude && (!comment || comment === "Escaneo de código QR (automático)");

    if (isAutomatic) {
      // Avoid duplicate automatic scans (e.g. from page refresh or React StrictMode dual mount)
      res.status(200).json({
        message: "Escaneo ya registrado recientemente",
        scan: recentScan,
      });
      return;
    }

    // Coalesce current scan data into the recent scan
    const updates: Partial<Scan> = {};
    if (latitude) updates.latitude = Number(latitude);
    if (longitude) updates.longitude = Number(longitude);
    if (comment && comment !== "Escaneo de código QR (automático)") {
      if (comment.includes("Ubicación GPS") && recentScan.comment) {
        // Keep user's comment if it's already set
      } else {
        updates.comment = comment;
      }
    }
    if (photoUrl) updates.photoUrl = photoUrl;

    const updatedScan = dbStore.updateScan(recentScan.id, updates);

    // Update existing notification if it exists for this scan
    const existingNotification = dbStore.getNotificationByScanId(recentScan.id);
    if (existingNotification) {
      const isLost = pet.status === "perdido";
      const title = isLost ? `⚠️ ¡Mascota Perdida! Escaneo de ${pet.name}` : `🐾 Escaneo de QR de ${pet.name}`;
      
      let message = `El código QR de ${pet.name} fue escaneado desde ${recentScan.city}, ${recentScan.country} usando ${recentScan.device} (${recentScan.os}).`;
      const finalComment = updates.comment || recentScan.comment;
      if (finalComment) {
        message += ` Comentario de quien lo encontró: "${finalComment}"`;
      }
      if (updates.latitude || recentScan.latitude) {
        message += ` [Ubicación GPS Adjunta]`;
      }

      const updatedNotif = dbStore.updateNotification(existingNotification.id, {
        type: (updates.latitude || recentScan.latitude) ? "location" : "scan",
        title,
        message,
      });

      if (updatedNotif) {
        sendLiveNotification(pet.userId, updatedNotif);
      }
    }

    // Send update email only if we added significant information (coordinates or comments) that weren't there before
    const hadGps = !!recentScan.latitude;
    const hasGpsNow = !!updates.latitude;
    const hadComment = !!recentScan.comment;
    const hasCommentNow = !!updates.comment && updates.comment !== recentScan.comment;

    if ((hasGpsNow && !hadGps) || (hasCommentNow && !hadComment)) {
      dbStore.addDevEmail({
        to: pet.ownerContact.email || "propietario@petlinkqr.com",
        subject: `🔔 Actualización de escaneo para ${pet.name}`,
        body: `¡Hola!\n\nSe ha actualizado el escaneo reciente de tu mascota, ${pet.name}, con nueva información de contacto o ubicación.\n\nInformación actualizada:\n- Fecha y Hora: ${recentScan.date} ${recentScan.time}\n- Ubicación aproximada: ${recentScan.city}, ${recentScan.country}\n${updates.comment || recentScan.comment ? `- Comentario del rescatista: "${updates.comment || recentScan.comment}"\n` : ""}${(updates.latitude || recentScan.latitude) ? `- Coordenadas de GPS: ${updates.latitude || recentScan.latitude}, ${updates.longitude || recentScan.longitude} (Puedes verlas en el mapa del perfil de tu mascota)\n` : ""}\nIngresa a PetLink QR para ver la ubicación exacta y contactar al rescatista.\n\nAtentamente,\nAlerta de Emergencia PetLink QR`,
      });
    }

    res.status(200).json({
      message: "Escaneo actualizado con éxito",
      scan: updatedScan || recentScan,
    });
    return;
  }

  // No recent scan, create a brand new scan!
  const scanId = "scan-" + Math.random().toString(36).substring(2, 11);
  const newScan: Scan = {
    id: scanId,
    petId: pet.id,
    date: dateStr,
    time: timeStr,
    browser,
    os,
    device,
    ip,
    city,
    country,
    latitude: latitude ? Number(latitude) : undefined,
    longitude: longitude ? Number(longitude) : undefined,
    comment: comment || undefined,
    photoUrl: photoUrl || undefined,
    createdAt: now.toISOString(),
  };

  dbStore.addScan(newScan);

  // Trigger Notification to Pet Owner
  const notifId = "notif-" + Math.random().toString(36).substring(2, 11);
  const isLost = pet.status === "perdido";

  const title = isLost ? `⚠️ ¡Mascota Perdida! Escaneo de ${pet.name}` : `🐾 Escaneo de QR de ${pet.name}`;
  let message = `El código QR de ${pet.name} fue escaneado desde ${city}, ${country} usando ${device} (${os}).`;
  if (comment) {
    message += ` Comentario de quien lo encontró: "${comment}"`;
  }

  const newNotification: Notification = {
    id: notifId,
    userId: pet.userId,
    petId: pet.id,
    scanId,
    type: latitude && longitude ? "location" : "scan",
    title,
    message,
    date: dateStr,
    time: timeStr,
    isRead: false,
    createdAt: now.toISOString(),
  };

  dbStore.addNotification(newNotification);

  // Push Live over Server-Sent Events (SSE)
  sendLiveNotification(pet.userId, newNotification);

  // Send Alert Email (Simulated)
  dbStore.addDevEmail({
    to: pet.ownerContact.email || "propietario@petlinkqr.com",
    subject: `🔔 Se escaneó el QR de tu mascota: ${pet.name}`,
    body: `¡Hola!\n\nEl código QR del collar de tu mascota, ${pet.name}, acaba de ser escaneado.\n\nInformación del escaneo:\n- Fecha y Hora: ${dateStr} ${timeStr}\n- Ubicación aproximada: ${city}, ${country}\n- Dispositivo: ${device} (${os})\n- Navegador: ${browser}\n${comment ? `- Comentario: "${comment}"\n` : ""}${latitude && longitude ? `- Coordenadas de GPS: ${latitude}, ${longitude} (Puedes verlas en el mapa del perfil de tu mascota)\n` : ""}\nIngresa a PetLink QR para ver todos los detalles y el historial completo.\n\nAtentamente,\nAlerta de Emergencia PetLink QR`,
  });

  res.status(201).json({
    message: "Escaneo registrado con éxito",
    scan: newScan,
  });
});

/* ==========================================================================
   API ROUTES - NOTIFICATIONS & HISTORIES
   ========================================================================== */

// Get notification history for logged user
app.get("/api/notifications", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const notifications = dbStore.getNotificationsByUserId(userId);
  
  const enriched = notifications.map((n: any) => {
    const pet = dbStore.getPetById(n.petId);
    const scan = dbStore.getScanById(n.scanId);
    return {
      ...n,
      petName: pet?.name || "Mascota",
      petPhotoUrl: pet?.photoUrl || "",
      latitude: scan?.latitude,
      longitude: scan?.longitude,
      city: scan?.city || n.city,
      comment: scan?.comment || n.comment,
    };
  });

  res.json(enriched);
});

// Mark notification as read
app.put("/api/notifications/:id/read", authenticateToken, (req: AuthenticatedRequest, res) => {
  const notifId = req.params.id;
  dbStore.markNotificationAsRead(notifId);
  res.json({ message: "Notificación marcada como leída" });
});

// Mark all notifications as read
app.put("/api/notifications/read-all", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  dbStore.markAllNotificationsAsRead(userId);
  res.json({ message: "Todas las notificaciones marcadas como leídas" });
});

// Get scans for a single pet
app.get("/api/pets/:id/scans", authenticateToken, (req: AuthenticatedRequest, res) => {
  const petId = req.params.id;
  const pet = dbStore.getPetById(petId);

  if (!pet) {
    res.status(404).json({ error: "Mascota no encontrada" });
    return;
  }

  // Ensure owner or admin
  if (pet.userId !== req.user!.id && req.user!.role !== "admin") {
    res.status(403).json({ error: "No tienes autorización para ver el historial de esta mascota" });
    return;
  }

  res.json(dbStore.getScansByPetId(petId));
});

// Server-Sent Events Endpoint for live notifications in front-end
app.get("/api/notifications/sse", (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    res.status(401).json({ error: "Token ausente" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = decoded.id;

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Register SSE client
    if (!sseClients.has(userId)) {
      sseClients.set(userId, []);
    }
    sseClients.get(userId)!.push(res);

    // Heartbeat every 20 seconds to prevent timeout
    const heartbeat = setInterval(() => {
      res.write(":\n\n");
    }, 20000);

    req.on("close", () => {
      clearInterval(heartbeat);
      const list = sseClients.get(userId);
      if (list) {
        sseClients.set(
          userId,
          list.filter((c) => c !== res)
        );
      }
    });
  } catch (err) {
    res.status(403).json({ error: "Token SSE inválido" });
  }
});

/* ==========================================================================
   API ROUTES - ADMIN ONLY
   ========================================================================== */

// Dashboard platform statistics
app.get("/api/admin/stats", authenticateToken, requireAdmin, (req, res) => {
  const pets = dbStore.getPets();
  const users = dbStore.getUsers();
  const scans = dbStore.getScans();

  const activeLostCount = pets.filter((p) => p.status === "perdido").length;
  const totalScans = scans.length;

  res.json({
    totalPets: pets.length,
    totalUsers: users.length - 1, // Exclude the default admin in stats if wanted, or count all
    lostPets: activeLostCount,
    totalScans,
    scansLastMonth: totalScans, // simplified
  });
});

// Manage users list
app.get("/api/admin/users", authenticateToken, requireAdmin, (req, res) => {
  const users = dbStore.getUsers().map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    photoUrl: u.photoUrl,
    createdAt: u.createdAt,
    isBlocked: u.isBlocked,
    petsCount: dbStore.getPetsByUserId(u.id).length,
  }));
  res.json(users);
});

// Block/Unblock user
app.put("/api/admin/users/:id/block", authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;
  const { block } = req.body;

  if (userId === "admin-1") {
    res.status(400).json({ error: "No se puede bloquear al super-administrador" });
    return;
  }

  const updated = dbStore.updateUser(userId, { isBlocked: !!block });
  if (!updated) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  res.json({ message: block ? "Usuario bloqueado con éxito" : "Usuario desbloqueado con éxito", user: updated });
});

// Delete user profile
app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;

  if (userId === "admin-1") {
    res.status(400).json({ error: "No se puede eliminar al super-administrador" });
    return;
  }

  dbStore.deleteUser(userId);
  res.json({ message: "Usuario y sus mascotas eliminados de forma permanente" });
});

// Get all pets inside Admin panel
app.get("/api/admin/pets", authenticateToken, requireAdmin, (req, res) => {
  const pets = dbStore.getPets().map((p) => {
    const owner = dbStore.getUserById(p.userId);
    return {
      ...p,
      ownerEmail: owner?.email || "Desconocido",
      ownerName: owner?.name || "Desconocido",
    };
  });
  res.json(pets);
});

/* ==========================================================================
   API ROUTES - DEV TOOLS / TEST UTILS
   ========================================================================== */

// Get in-app emails
app.get("/api/dev/emails", (req, res) => {
  res.json(dbStore.getDevEmails());
});

// Clear in-app emails
app.delete("/api/dev/emails", (req, res) => {
  dbStore.clearDevEmails();
  res.json({ message: "Historial de correos vaciado" });
});

/* ==========================================================================
   VITE DEVELOPMENT & PRODUCTION CLIENT SERVING
   ========================================================================== */

// Export app for serverless deployment (e.g. Vercel)
export default app;

// Only start the standalone Express server if we're not running as a Vercel serverless function
if (!process.env.VERCEL) {
  const startServer = async () => {
    if (process.env.NODE_ENV !== "production") {
      const { createServer } = await import("vite");
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`PetLink QR full-stack Express server listening on port ${PORT}`);
    });
  };

  startServer();
}
