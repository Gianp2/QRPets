export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  photoUrl: string;
  createdAt: string;
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
  isAuthorizedToEdit?: boolean;
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
  photoUrl?: string;
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
  petName?: string;
  petPhotoUrl?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  comment?: string;
}

export interface DevEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

export interface AdminStats {
  totalPets: number;
  totalUsers: number;
  lostPets: number;
  totalScans: number;
  scansLastMonth: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  photoUrl: string;
  createdAt: string;
  isBlocked: boolean;
  petsCount: number;
}

export interface AdminPet extends Pet {
  ownerEmail: string;
  ownerName: string;
}
