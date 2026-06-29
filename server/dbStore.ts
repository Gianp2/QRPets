import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "admin" | "user";
  photoUrl: string;
  createdAt: string;
  isBlocked: boolean;
}

export interface PetContact {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  address?: string;
}

export interface Pet {
  id: string;
  userId: string;
  photoUrl: string;
  name: string;
  species: string;
  breed: string;
  gender: "macho" | "hembra";
  birthDate: string;
  weight: number;
  color: string;
  microchipNumber?: string;
  description: string;
  status: "casa" | "perdido";
  allergies: string;
  medication: string;
  illnesses: string;
  vetName: string;
  observations: string;
  ownerContact: PetContact;
  qrCodeId: string;
  scansCount: number;
  createdAt: string;
}

export interface Scan {
  id: string;
  petId: string;
  date: string;
  time: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  comment?: string;
  photoUrl?: string; // Optional finder upload photo
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  petId: string;
  scanId: string;
  type: "scan" | "location";
  title: string;
  message: string;
  date: string;
  time: string;
  isRead: boolean;
  createdAt: string;
}

export interface DevEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

interface DatabaseSchema {
  users: User[];
  pets: Pet[];
  scans: Scan[];
  notifications: Notification[];
  devEmails: DevEmail[];
}

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

class DbStore {
  private data: DatabaseSchema = {
    users: [],
    pets: [],
    scans: [],
    notifications: [],
    devEmails: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (isVercel && !fs.existsSync(DB_FILE)) {
      try {
        const workspaceDbFile = path.join(process.cwd(), "data", "db.json");
        if (fs.existsSync(workspaceDbFile)) {
          fs.copyFileSync(workspaceDbFile, DB_FILE);
          console.log("Successfully copied seed database to /tmp/db.json");
        }
      } catch (err) {
        console.error("Failed to copy seed database to /tmp/db.json, will seed defaults", err);
      }
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error("Error reading database file, starting clean", err);
        this.seedDefaults();
      }
    } else {
      this.seedDefaults();
    }
  }

  private seedDefaults() {
    // Seed default admin account
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync("admin123", salt);

    const defaultAdmin: User = {
      id: "admin-1",
      email: "admin@petlinkqr.com",
      passwordHash,
      name: "Administrador PetLink",
      role: "admin",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      isBlocked: false,
    };

    // Seed default user account
    const userPasswordHash = bcrypt.hashSync("user123", salt);
    const defaultUser: User = {
      id: "user-1",
      email: "demo@petlinkqr.com",
      passwordHash: userPasswordHash,
      name: "Juan Pérez",
      role: "user",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      isBlocked: false,
    };

    // Seed a couple of pets for demonstration
    const pet1: Pet = {
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
        address: "Av. Pellegrini 1200",
      },
      qrCodeId: "qr-toby",
      scansCount: 3,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    };

    const pet2: Pet = {
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
        address: "Av. Pellegrini 1200",
      },
      qrCodeId: "qr-luna",
      scansCount: 2,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    };

    // Seed scans for default pets
    const scan1: Scan = {
      id: "scan-1",
      petId: "pet-toby",
      date: "2026-06-25",
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
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const scan2: Scan = {
      id: "scan-2",
      petId: "pet-toby",
      date: "2026-06-26",
      time: "18:11",
      browser: "Safari",
      os: "iOS",
      device: "Mobile",
      ip: "186.22.145.89",
      city: "Córdoba",
      country: "Argentina",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const scan3: Scan = {
      id: "scan-3",
      petId: "pet-luna",
      date: "2026-06-27",
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
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    };

    // Seed notifications
    const notif1: Notification = {
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
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const notif2: Notification = {
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
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    };

    this.data.users = [defaultAdmin, defaultUser];
    this.data.pets = [pet1, pet2];
    this.data.scans = [scan1, scan2, scan3];
    this.data.notifications = [notif1, notif2];
    this.data.devEmails = [];

    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing to database file", err);
    }
  }

  // Users Operations
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  public updateUser(id: string, updates: Partial<Omit<User, "id" | "email">>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return undefined;
  }

  public deleteUser(id: string) {
    this.data.users = this.data.users.filter((u) => u.id !== id);
    this.data.pets = this.data.pets.filter((p) => p.userId !== id); // Cascade delete pets
    this.save();
  }

  // Pets Operations
  public getPets(): Pet[] {
    return this.data.pets;
  }

  public getPetsByUserId(userId: string): Pet[] {
    return this.data.pets.filter((p) => p.userId === userId);
  }

  public getPetById(id: string): Pet | undefined {
    return this.data.pets.find((p) => p.id === id);
  }

  public getPetByQrCodeId(qrCodeId: string): Pet | undefined {
    return this.data.pets.find((p) => p.qrCodeId === qrCodeId || p.id === qrCodeId);
  }

  public addPet(pet: Pet) {
    this.data.pets.push(pet);
    this.save();
  }

  public updatePet(id: string, updates: Partial<Omit<Pet, "id" | "userId" | "createdAt">>) {
    const idx = this.data.pets.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.pets[idx] = { ...this.data.pets[idx], ...updates };
      this.save();
      return this.data.pets[idx];
    }
    return undefined;
  }

  public deletePet(id: string) {
    this.data.pets = this.data.pets.filter((p) => p.id !== id);
    this.data.scans = this.data.scans.filter((s) => s.petId !== id);
    this.data.notifications = this.data.notifications.filter((n) => n.petId !== id);
    this.save();
  }

  // Scans Operations
  public getScans(): Scan[] {
    return this.data.scans;
  }

  public getScansByPetId(petId: string): Scan[] {
    return this.data.scans.filter((s) => s.petId === petId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getScanById(id: string): Scan | undefined {
    return this.data.scans.find((s) => s.id === id);
  }

  public updateScan(id: string, updates: Partial<Scan>): Scan | undefined {
    const idx = this.data.scans.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.scans[idx] = { ...this.data.scans[idx], ...updates };
      this.save();
      return this.data.scans[idx];
    }
    return undefined;
  }

  public addScan(scan: Scan) {
    this.data.scans.push(scan);
    
    // Increment scansCount in Pet
    const petIdx = this.data.pets.findIndex((p) => p.id === scan.petId);
    if (petIdx !== -1) {
      this.data.pets[petIdx].scansCount += 1;
    }

    this.save();
  }

  // Notifications Operations
  public getNotificationsByUserId(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getNotificationsByPetId(petId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.petId === petId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getNotificationByScanId(scanId: string): Notification | undefined {
    return this.data.notifications.find((n) => n.scanId === scanId);
  }

  public updateNotification(id: string, updates: Partial<Notification>): Notification | undefined {
    const idx = this.data.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.data.notifications[idx] = { ...this.data.notifications[idx], ...updates };
      this.save();
      return this.data.notifications[idx];
    }
    return undefined;
  }

  public addNotification(notification: Notification) {
    this.data.notifications.push(notification);
    this.save();
  }

  public markNotificationAsRead(id: string) {
    const idx = this.data.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.data.notifications[idx].isRead = true;
      this.save();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.save();
  }

  // Dev Emails Operations
  public getDevEmails(): DevEmail[] {
    return this.data.devEmails.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  public addDevEmail(email: Omit<DevEmail, "id" | "sentAt">) {
    const newEmail: DevEmail = {
      id: "email-" + Math.random().toString(36).substring(2, 11),
      ...email,
      sentAt: new Date().toISOString(),
    };
    this.data.devEmails.push(newEmail);
    this.save();
  }

  public clearDevEmails() {
    this.data.devEmails = [];
    this.save();
  }
}

export const dbStore = new DbStore();
