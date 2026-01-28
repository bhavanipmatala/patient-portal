import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, Conversation, Message, Notification, HealthcareProvider, Patient } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('patient');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; patient: Patient }>> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    address?: string;
  }): Promise<ApiResponse<{ token: string; patient: Patient }>> {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<Patient>> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Conversation endpoints
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    const response = await this.api.get('/messages/conversations');
    return response.data;
  }

  async createConversation(data: {
    providerId: number;
    subject: string;
    initialMessage: string;
  }): Promise<ApiResponse<Conversation>> {
    const response = await this.api.post('/messages/conversations', data);
    return response.data;
  }

  async archiveConversation(conversationId: number): Promise<ApiResponse> {
    const response = await this.api.put(`/messages/conversations/${conversationId}/archive`);
    return response.data;
  }

  async markConversationAsRead(conversationId: number): Promise<ApiResponse> {
    const response = await this.api.put(`/messages/conversations/${conversationId}/read`);
    return response.data;
  }

  // Message endpoints
  async getMessages(conversationId: number): Promise<ApiResponse<Message[]>> {
    const response = await this.api.get(`/messages/conversations/${conversationId}/messages`);
    return response.data;
  }

  async sendMessage(conversationId: number, content: string): Promise<ApiResponse<Message>> {
    const response = await this.api.post(`/messages/conversations/${conversationId}/messages`, { content });
    return response.data;
  }

  async deleteMessage(messageId: number): Promise<ApiResponse> {
    const response = await this.api.delete(`/messages/messages/${messageId}`);
    return response.data;
  }

  // Provider endpoints
  async getProviders(): Promise<ApiResponse<HealthcareProvider[]>> {
    const response = await this.api.get('/messages/providers');
    return response.data;
  }

  // Notification endpoints
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    const response = await this.api.get('/notifications');
    return response.data;
  }

  async getUnreadNotificationCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    const response = await this.api.get('/notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(notificationId: number): Promise<ApiResponse> {
    const response = await this.api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    const response = await this.api.put('/notifications/mark-all-read');
    return response.data;
  }

  async deleteNotification(notificationId: number): Promise<ApiResponse> {
    const response = await this.api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
