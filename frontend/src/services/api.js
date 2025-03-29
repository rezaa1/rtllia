import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api'
});

// Add token to requests if it exists
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Handle token expiration and other common errors
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Set tenant header for multi-tenant requests
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
      API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await API.post('/users', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
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

// Resource service for fetching voices, models, etc.
export const resourceService = {
  getAvailableResources: async (forceRefresh = false) => {
    const url = forceRefresh 
      ? '/resources/available-resources?forceRefresh=true' 
      : '/resources/available-resources';
    const response = await API.get(url);
    return response.data;
  },
  
  refreshResources: async () => {
    const response = await API.post('/resources/refresh-resources');
    return response.data;
  },
  
  checkCompatibility: async (voiceId, s2sModel) => {
    const response = await API.post('/resources/check-compatibility', {
      voiceId,
      s2sModel
    });
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
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await API.post('/agents', agentData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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

// Widget service
export const widgetService = {
  createWidget: async (widgetData) => {
    // The token is already handled by the API interceptor, no need to add it manually
    const response = await API.post('/widgets', widgetData);
    return response.data;
  },
  
  updateWidget: async (id, widgetData) => {
    const response = await API.put(`/widgets/${id}`, widgetData);
    return response.data;
  },
  
  deleteWidget: async (id) => {
    const response = await API.delete(`/widgets/${id}`);
    return response.data;
  }
};

export default API;
