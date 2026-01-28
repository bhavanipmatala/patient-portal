export interface Patient {
  PatientId: number;
  FirstName: string;
  LastName: string;
  Email: string;
  DateOfBirth?: string;
  PhoneNumber?: string;
  Address?: string;
  ProfileImage?: string;
  CreatedAt: string;
  UpdatedAt: string;
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
}

export interface Conversation {
  ConversationId: number;
  PatientId: number;
  ProviderId: number;
  Subject?: string;
  CreatedAt: string;
  UpdatedAt: string;
  IsArchived: boolean;
  ProviderName?: string;
  ProviderSpecialty?: string;
  ProviderDepartment?: string;
  LastMessage?: string;
  LastMessageDate?: string;
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
  CreatedAt: string;
  ReadAt?: string;
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
  CreatedAt: string;
}

export interface AuthContextType {
  patient: Patient | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
