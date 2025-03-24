import axios from 'axios';

// Get the current hostname
const currentHostname = window.location.hostname;
const currentPort = window.location.port ? `:${window.location.port}` : '';
const protocol = window.location.protocol;

// Determine the API base URL
let apiBaseUrl;
if (process.env.REACT_APP_API_URL) {
  // Use environment variable if available
  apiBaseUrl = process.env.REACT_APP_API_URL;
} else if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
  // Use localhost for local development
  apiBaseUrl = 'http://localhost:5000/api';
} else {
  // For external access, use the same hostname but with backend port
  apiBaseUrl = `${protocol}//${currentHostname}:5000/api`;
}

// Create axios instance with base URL
const API = axios.create({
  baseURL: apiBaseUrl
});

// Add auth token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle tenant-specific requests
export const setTenantHeader = (domain) => {
  if (domain) {
    API.defaults.headers.common['X-Tenant-Domain'] = domain;
  } else {
    delete API.defaults.headers.common['X-Tenant-Domain'];
  }
};

// Auth service
export const authService = {
  login: async (email, password) => {
    const response = await API.post('/users/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await API.post('/users/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    const response = await API.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await API.put('/users/profile', userData);
    return response.data;
  }
};

// Organization service
export const organizationService = {
  createOrganization: async (orgData) => {
    const response = await API.post('/organizations', orgData);
    return response.data;
  },
  
  getOrganizationById: async (id) => {
    const response = await API.get(`/organizations/${id}`);
    return response.data;
  },
  
  updateOrganization: async (id, orgData) => {
    const response = await API.put(`/organizations/${id}`, orgData);
    return response.data;
  },
  
  getOrganizationUsers: async (id) => {
    const response = await API.get(`/organizations/${id}/users`);
    return response.data;
  },
  
  addUserToOrganization: async (id, userData) => {
    const response = await API.post(`/organizations/${id}/users`, userData);
    return response.data;
  },
  
  checkSlugAvailability: async (slug) => {
    const response = await API.get(`/organizations/check-slug/${slug}`);
    return response.data;
  },
  
  getOrganizationByDomain: async (domain) => {
    const response = await API.get(`/organizations/domain/${domain}`);
    return response.data;
  }
};

// White label service
export const whiteLabelService = {
  getWhiteLabelSettings: async (organizationId) => {
    const response = await API.get(`/white-label/${organizationId}`);
    return response.data;
  },
  
  updateWhiteLabelSettings: async (organizationId, settings) => {
    const response = await API.put(`/white-label/${organizationId}`, settings);
    return response.data;
  },
  
  uploadLogo: async (organizationId, formData) => {
    const response = await API.post(`/white-label/${organizationId}/upload-logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  uploadFavicon: async (organizationId, formData) => {
    const response = await API.post(`/white-label/${organizationId}/upload-favicon`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  uploadBackground: async (organizationId, formData) => {
    const response = await API.post(`/white-label/${organizationId}/upload-background`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  getWhiteLabelSettingsByDomain: async (domain) => {
    const response = await API.get(`/white-label/domain/${domain}`);
    return response.data;
  }
};

// Agent service
export const agentService = {
  getAgents: async () => {
    const response = await API.get('/agents');
    return response.data;
  },
  
  getAgentById: async (id) => {
    const response = await API.get(`/agents/${id}`);
    return response.data;
  },
  
  createAgent: async (agentData) => {
    const response = await API.post('/agents', agentData);
    return response.data;
  },
  
  updateAgent: async (id, agentData) => {
    const response = await API.put(`/agents/${id}`, agentData);
    return response.data;
  },
  
  deleteAgent: async (id) => {
    const response = await API.delete(`/agents/${id}`);
    return response.data;
  }
};

// Call service
export const callService = {
  getCalls: async () => {
    const response = await API.get('/calls');
    return response.data;
  },
  
  getCallById: async (id) => {
    const response = await API.get(`/calls/${id}`);
    return response.data;
  },
  
  createCall: async (callData) => {
    const response = await API.post('/calls', callData);
    return response.data;
  }
};

// Subscription service
export const subscriptionService = {
  getSubscriptionPlans: async () => {
    const response = await API.get('/subscriptions/plans');
    return response.data;
  },
  
  getCurrentSubscription: async (organizationId) => {
    const response = await API.get(`/subscriptions/organizations/${organizationId}`);
    return response.data;
  },
  
  subscribeToplan: async (organizationId, planData) => {
    const response = await API.post(`/subscriptions/organizations/${organizationId}`, planData);
    return response.data;
  },
  
  cancelSubscription: async (organizationId) => {
    const response = await API.delete(`/subscriptions/organizations/${organizationId}`);
    return response.data;
  },
  
  getPaymentMethods: async (organizationId) => {
    const response = await API.get(`/subscriptions/organizations/${organizationId}/payment-methods`);
    return response.data;
  },
  
  addPaymentMethod: async (organizationId, paymentMethodData) => {
    const response = await API.post(`/subscriptions/organizations/${organizationId}/payment-methods`, paymentMethodData);
    return response.data;
  }
};

// Usage statistics service
export const usageService = {
  getUsageStatistics: async (organizationId, year, month) => {
    const response = await API.get(`/usage/${organizationId}?year=${year}&month=${month}`);
    return response.data;
  },
  
  getUsageHistory: async (organizationId) => {
    const response = await API.get(`/usage/${organizationId}/history`);
    return response.data;
  }
};

export default API;
