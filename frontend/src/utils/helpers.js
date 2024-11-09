export const formatErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error.response?.data?.message) return error.response.data.message;
    return 'An unexpected error occurred';
  };
  
  export const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  };
  
  export const getAuthToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  };
  
  export const clearAuthData = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };