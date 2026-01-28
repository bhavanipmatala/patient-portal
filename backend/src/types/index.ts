import { Request } from 'express';

export interface Patient {
  PatientId: number;
  FirstName: string;
  LastName: string;
  Email: string;
  PasswordHash?: string;
  DateOfBirth?: Date;
  PhoneNumber?: string;
  Address?: string;
  ProfileImage?: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  IsActive: boolean;
}

export interface HealthcareProvider {
  ProviderId: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Specialty?: string;
  Department?: string;
  PhoneNumber?: string;
  ProfileImage?: string;
  CreatedAt: Date;
  IsActive: boolean;
}

export interface Conversation {
  ConversationId: number;
  PatientId: number;
  ProviderId: number;
  Subject?: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  IsArchived: boolean;
  ProviderName?: string;
  ProviderSpecialty?: string;
  LastMessage?: string;
  LastMessageDate?: Date;
  UnreadCount?: number;
}

export interface Message {
  MessageId: number;
  ConversationId: number;
  SenderId: number;
  SenderType: 'Patient' | 'Provider';
  Content: string;
  IsRead: boolean;
  IsDeleted: boolean;
  CreatedAt: Date;
  ReadAt?: Date;
  SenderName?: string;
}

export interface Notification {
  NotificationId: number;
  PatientId: number;
  Title: string;
  Message: string;
  Type: 'NewMessage' | 'Appointment' | 'Reminder';
  IsRead: boolean;
  RelatedMessageId?: number;
  CreatedAt: Date;
}

export interface AuthRequest extends Request {
  patient?: Patient;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JwtPayload {
  patientId: number;
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
