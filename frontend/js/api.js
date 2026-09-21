/**
 * Scriptify Client API Wrapper
 * Handles JWT token injection, response parsing, and global error handling
 */

const API = (() => {
  const BASE_URL = window.location.origin;

  const getToken = () => localStorage.getItem('scriptify_token');
  const setToken = (token) => localStorage.setItem('scriptify_token', token);
  const removeToken = () => localStorage.removeItem('scriptify_token');

  const request = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const token = getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Trigger specific events for 401 (Auth needed) and 402 (Insufficient credits)
        if (response.status === 401) {
          window.dispatchEvent(new CustomEvent('scriptify:auth_required'));
        } else if (response.status === 402) {
          window.dispatchEvent(new CustomEvent('scriptify:insufficient_credits', { detail: data }));
        }

        const error = new Error(data.error || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  };

  return {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    getToken,
    setToken,
    removeToken,
    isAuthenticated: () => !!getToken()
  };
})();
