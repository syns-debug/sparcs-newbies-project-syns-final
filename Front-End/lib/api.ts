const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function api(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || 'API 요청 실패');
  }
  
  return data;
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function isLoggedIn() {
  return !!getToken();
}
