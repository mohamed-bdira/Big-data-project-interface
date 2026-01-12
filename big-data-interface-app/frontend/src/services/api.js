const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Helper function to get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to set auth token in localStorage
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token from localStorage
const removeToken = () => {
  localStorage.removeItem('token');
};

// Helper function to get headers with auth token
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to parse response safely
const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  
  // Read response as text first
  const text = await response.text();
  
  // Check if response is empty
  if (!text || text.trim() === '') {
    if (response.ok) {
      return null;
    } else {
      throw new Error(`Server returned empty response. Status: ${response.status}`);
    }
  }
  
  // Check if response should be JSON
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch (e) {
      // If JSON parsing fails, provide more context
      const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
      throw new Error(`Server returned invalid JSON. Status: ${response.status}. Response: ${preview}`);
    }
  }
  
  // If not JSON and response is not OK, throw error with text preview
  if (!response.ok) {
    const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
    throw new Error(`Server error (${response.status}): ${preview}`);
  }
  
  // If response is OK but not JSON, return text as message
  return { message: text };
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Handle 404 - endpoint doesn't exist
      if (response.status === 404) {
        throw new Error('Login endpoint not found. Please ensure the backend server is running and the API is configured correctly.');
      }

      // Handle 500 - server error
      if (response.status === 500) {
        throw new Error('Server error. Please try again later or contact support.');
      }

      let data;
      try {
        data = await parseResponse(response);
      } catch (parseError) {
        if (parseError.message.includes('Server returned invalid JSON') || parseError.message.includes('Server error')) {
          throw parseError;
        }
        throw new Error(`Unable to parse server response. Status: ${response.status}`);
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `Login failed (${response.status}). Please check your credentials.`;
        throw new Error(errorMsg);
      }

      if (data && data.token) {
        setToken(data.token);
      }

      return data || {};
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on http://127.0.0.1:5000');
      }
      // Re-throw with proper message
      throw error instanceof Error ? error : new Error(error.message || 'An unexpected error occurred');
    }
  },

  register: async (email, password, name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.status === 404) {
        throw new Error('Registration endpoint not found. Please ensure the backend server is running and the API is configured correctly.');
      }

      if (response.status === 500) {
        throw new Error('Server error. Please try again later or contact support.');
      }

      let data;
      try {
        data = await parseResponse(response);
      } catch (parseError) {
        if (parseError.message.includes('Server returned invalid JSON') || parseError.message.includes('Server error')) {
          throw parseError;
        }
        throw new Error(`Unable to parse server response. Status: ${response.status}`);
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `Registration failed (${response.status}). Please try again.`;
        throw new Error(errorMsg);
      }

      if (data && data.token) {
        setToken(data.token);
      }

      return data || {};
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on http://127.0.0.1:5000');
      }
      throw error instanceof Error ? error : new Error(error.message || 'An unexpected error occurred');
    }
  },

  logout: () => {
    removeToken();
  },

  isAuthenticated: () => {
    return !!getToken();
  },
};

// Data API
export const dataAPI = {
  getSensorData: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/data/sensor${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.status === 404) {
        throw new Error('Sensor data endpoint not found. Please ensure the backend API is configured correctly.');
      }

      if (response.status === 401) {
        removeToken();
        throw new Error('Session expired. Please login again.');
      }

      let data;
      try {
        data = await parseResponse(response);
      } catch (parseError) {
        if (parseError.message.includes('Server returned invalid JSON') || parseError.message.includes('Server error')) {
          throw parseError;
        }
        throw new Error(`Unable to parse server response. Status: ${response.status}`);
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `Failed to fetch sensor data (${response.status})`;
        throw new Error(errorMsg);
      }

      return data || [];
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on http://127.0.0.1:5000');
      }
      throw error instanceof Error ? error : new Error(error.message || 'Failed to fetch sensor data');
    }
  },

  getAlerts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data/alerts`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.status === 404) {
        throw new Error('Alerts endpoint not found. Please ensure the backend API is configured correctly.');
      }

      if (response.status === 401) {
        removeToken();
        throw new Error('Session expired. Please login again.');
      }

      let data;
      try {
        data = await parseResponse(response);
      } catch (parseError) {
        if (parseError.message.includes('Server returned invalid JSON') || parseError.message.includes('Server error')) {
          throw parseError;
        }
        throw new Error(`Unable to parse server response. Status: ${response.status}`);
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `Failed to fetch alerts (${response.status})`;
        throw new Error(errorMsg);
      }

      return data || [];
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on http://127.0.0.1:5000');
      }
      throw error instanceof Error ? error : new Error(error.message || 'Failed to fetch alerts');
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.status === 404) {
        throw new Error('Dashboard stats endpoint not found. Please ensure the backend API is configured correctly.');
      }

      if (response.status === 401) {
        removeToken();
        throw new Error('Session expired. Please login again.');
      }

      let data;
      try {
        data = await parseResponse(response);
      } catch (parseError) {
        if (parseError.message.includes('Server returned invalid JSON') || parseError.message.includes('Server error')) {
          throw parseError;
        }
        throw new Error(`Unable to parse server response. Status: ${response.status}`);
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `Failed to fetch dashboard stats (${response.status})`;
        throw new Error(errorMsg);
      }

      return data || {};
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on http://127.0.0.1:5000');
      }
      throw error instanceof Error ? error : new Error(error.message || 'Failed to fetch dashboard stats');
    }
  },
};

