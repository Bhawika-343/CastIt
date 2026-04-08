const API_URL = 'http://localhost:8085/api';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Something went wrong';
    const textData = await response.text();
    try {
      const errorData = JSON.parse(textData);
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch {
      if (textData) errorMsg = textData;
    }
    
    if ((response.status === 401 || response.status === 403) && 
        (errorMsg === 'Something went wrong' || errorMsg === 'Unauthorized' || errorMsg === 'Forbidden')) {
      errorMsg = 'Invalid username or password';
    }
    
    throw new Error(errorMsg);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};
