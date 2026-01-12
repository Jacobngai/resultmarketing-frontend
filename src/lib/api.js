/**
 * API Service Module
 * ResultMarketing CRM - Frontend API Integration
 */

import axios from 'axios';
import { supabase } from './supabase';

// API Base URLs
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const AI_API_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:8000/api';

// Create axios instances
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const aiClient = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // AI calls may take longer
});

// Request interceptor to add auth token
const addAuthInterceptor = (client) => {
  client.interceptors.request.use(
    async (config) => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        config.headers.Authorization = `Bearer ${data.session.access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Response interceptor for error handling
const addErrorInterceptor = (client) => {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError) {
          // Retry the request
          return client(error.config);
        }
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors
addAuthInterceptor(apiClient);
addAuthInterceptor(aiClient);
addErrorInterceptor(apiClient);
addErrorInterceptor(aiClient);

// ===========================================
// AUTH API
// ===========================================

export const authApi = {
  // Send OTP
  sendOtp: async (phone) => {
    const response = await apiClient.post('/auth/otp/send', { phone });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (phone, code) => {
    const response = await apiClient.post('/auth/otp/verify', { phone, code });
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (updates) => {
    const response = await apiClient.put('/auth/profile', updates);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

// ===========================================
// CONTACTS API
// ===========================================

export const contactsApi = {
  // Get contacts with pagination and filters
  getAll: async (params = {}) => {
    const response = await apiClient.get('/contacts', { params });
    return response.data;
  },

  // Get single contact
  getById: async (id) => {
    const response = await apiClient.get(`/contacts/${id}`);
    return response.data;
  },

  // Create contact
  create: async (contact) => {
    const response = await apiClient.post('/contacts', contact);
    return response.data;
  },

  // Update contact
  update: async (id, updates) => {
    const response = await apiClient.put(`/contacts/${id}`, updates);
    return response.data;
  },

  // Delete contact
  delete: async (id) => {
    const response = await apiClient.delete(`/contacts/${id}`);
    return response.data;
  },

  // Bulk import contacts
  bulkImport: async (contacts) => {
    const response = await apiClient.post('/contacts/bulk', { contacts });
    return response.data;
  },

  // Search contacts
  search: async (query, options = {}) => {
    const response = await apiClient.get('/contacts/search', {
      params: { q: query, ...options },
    });
    return response.data;
  },

  // Get contact stats
  getStats: async () => {
    const response = await apiClient.get('/contacts/stats');
    return response.data;
  },

  // Get interaction history
  getInteractions: async (contactId) => {
    const response = await apiClient.get(`/contacts/${contactId}/interactions`);
    return response.data;
  },
};

// ===========================================
// INTERACTIONS API
// ===========================================

export const interactionsApi = {
  // Log interaction
  create: async (contactId, interaction) => {
    const response = await apiClient.post('/interactions', {
      contact_id: contactId,
      ...interaction,
    });
    return response.data;
  },

  // Get interactions
  getAll: async (params = {}) => {
    const response = await apiClient.get('/interactions', { params });
    return response.data;
  },

  // Update interaction
  update: async (id, updates) => {
    const response = await apiClient.put(`/interactions/${id}`, updates);
    return response.data;
  },

  // Delete interaction
  delete: async (id) => {
    const response = await apiClient.delete(`/interactions/${id}`);
    return response.data;
  },
};

// ===========================================
// REMINDERS API
// ===========================================

export const remindersApi = {
  // Get reminders
  getAll: async (params = {}) => {
    const response = await apiClient.get('/reminders', { params });
    return response.data;
  },

  // Create reminder
  create: async (reminder) => {
    const response = await apiClient.post('/reminders', reminder);
    return response.data;
  },

  // Update reminder
  update: async (id, updates) => {
    const response = await apiClient.put(`/reminders/${id}`, updates);
    return response.data;
  },

  // Complete reminder
  complete: async (id) => {
    const response = await apiClient.put(`/reminders/${id}/complete`);
    return response.data;
  },

  // Delete reminder
  delete: async (id) => {
    const response = await apiClient.delete(`/reminders/${id}`);
    return response.data;
  },

  // Get today's reminders
  getToday: async () => {
    const response = await apiClient.get('/reminders/today');
    return response.data;
  },
};

// ===========================================
// CHAT API (AI)
// ===========================================

export const chatApi = {
  // Send message to AI
  sendMessage: async (message, conversationId = null, context = {}) => {
    const response = await apiClient.post('/chat', {
      message,
      conversation_id: conversationId,
      context,
    });
    return response.data;
  },

  // Get conversation history
  getHistory: async (conversationId) => {
    const response = await apiClient.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  // Get all conversations
  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    const response = await apiClient.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  // AI query (direct to AI service)
  query: async (message, contacts = []) => {
    const response = await aiClient.post('/chat/query', {
      message,
      contacts_context: contacts,
    });
    return response.data;
  },

  // Get follow-up suggestions
  getFollowUpSuggestions: async (contactId) => {
    const response = await aiClient.post('/chat/suggest-followup', {
      contact_id: contactId,
    });
    return response.data;
  },

  // Categorize contacts
  categorizeContacts: async (contacts) => {
    const response = await aiClient.post('/chat/categorize', {
      contacts,
    });
    return response.data;
  },
};

// ===========================================
// UPLOADS API
// ===========================================

export const uploadsApi = {
  // Upload spreadsheet
  uploadSpreadsheet: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options.preview) formData.append('preview', 'true');

    const response = await apiClient.post('/uploads/spreadsheet', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload with column mapping
  processSpreadsheet: async (file, columnMapping) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('column_mapping', JSON.stringify(columnMapping));

    const response = await apiClient.post('/uploads/spreadsheet/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload namecard
  uploadNamecard: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/uploads/namecard', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get upload status
  getStatus: async (jobId) => {
    const response = await apiClient.get(`/uploads/status/${jobId}`);
    return response.data;
  },

  // AI spreadsheet analysis
  analyzeSpreadsheet: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await aiClient.post('/spreadsheet/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // AI namecard scan
  scanNamecard: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await aiClient.post('/namecard/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ===========================================
// VOICE API (AI)
// ===========================================

export const voiceApi = {
  // Transcribe audio
  transcribe: async (audioFile, language = null) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    if (language) formData.append('language', language);

    const response = await aiClient.post('/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Transcribe and translate to English
  translate: async (audioFile) => {
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await aiClient.post('/voice/translate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Extract info from voice note
  extract: async (audioFile, contacts = []) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    if (contacts.length > 0) {
      formData.append('contacts_json', JSON.stringify(contacts));
    }

    const response = await aiClient.post('/voice/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Voice to chat query
  toChat: async (audioFile, context = null) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    if (context) formData.append('context', context);

    const response = await aiClient.post('/voice/chat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get supported formats
  getFormats: async () => {
    const response = await aiClient.get('/voice/formats');
    return response.data;
  },
};

// ===========================================
// PAYMENTS API
// ===========================================

export const paymentsApi = {
  // Get pricing
  getPricing: async () => {
    const response = await apiClient.get('/payments/pricing');
    return response.data;
  },

  // Create checkout session
  createCheckout: async (planId) => {
    const response = await apiClient.post('/payments/checkout', { planId });
    return response.data;
  },

  // Get subscription status
  getSubscription: async () => {
    const response = await apiClient.get('/payments/subscription');
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (immediately = false) => {
    const response = await apiClient.post('/payments/cancel', { immediately });
    return response.data;
  },

  // Resume subscription
  resumeSubscription: async () => {
    const response = await apiClient.post('/payments/resume');
    return response.data;
  },

  // Upgrade/downgrade plan
  changePlan: async (planId) => {
    const response = await apiClient.post('/payments/upgrade', { planId });
    return response.data;
  },

  // Get billing portal URL
  getBillingPortal: async () => {
    const response = await apiClient.post('/payments/portal');
    return response.data;
  },

  // Get invoices
  getInvoices: async () => {
    const response = await apiClient.get('/payments/invoices');
    return response.data;
  },
};

// ===========================================
// DASHBOARD API
// ===========================================

export const dashboardApi = {
  // Get dashboard stats
  getStats: async () => {
    const response = await apiClient.get('/contacts/stats');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    const response = await apiClient.get('/interactions', {
      params: { limit, sort: 'created_at:desc' },
    });
    return response.data;
  },

  // Get today's follow-ups
  getTodayFollowUps: async () => {
    const response = await apiClient.get('/reminders/today');
    return response.data;
  },
};

// ===========================================
// HEALTH CHECK
// ===========================================

export const healthApi = {
  // Check API health
  checkApi: async () => {
    try {
      const response = await apiClient.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Check AI service health
  checkAi: async () => {
    try {
      const response = await aiClient.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Export all APIs
export default {
  auth: authApi,
  contacts: contactsApi,
  interactions: interactionsApi,
  reminders: remindersApi,
  chat: chatApi,
  uploads: uploadsApi,
  voice: voiceApi,
  payments: paymentsApi,
  dashboard: dashboardApi,
  health: healthApi,
};
