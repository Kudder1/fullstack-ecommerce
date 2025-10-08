export const API_URL = import.meta.env.VITE_API_URL;

const fetchWrapper = async (url, options = {}, useAuth = true) => {
  const headers = {
    // 'Content-Type': 'application/json',
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (useAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const requestOptions = {
    ...options,
    headers
  };

  const response = await fetch(API_URL + url, requestOptions);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ошибка при выполнении запроса');
  }
  return response.json();
};

export const fetchGet = (url, useAuth = true) => 
  fetchWrapper(url, { method: 'GET' }, useAuth);

export const fetchPost = (url, body, useAuth = true) =>
  fetchWrapper(url, {
    method: 'POST',
    body: JSON.stringify(body),
  }, useAuth);

export const fetchPut = (url, body, useAuth = true) =>
  fetchWrapper(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  }, useAuth);

export const fetchDelete = (url, useAuth = true) =>
  fetchWrapper(url, { method: 'DELETE' }, useAuth);

export const fetchPostForm = (url, formData, useAuth = true) =>
  fetchWrapper(url, {
    method: 'POST',
    body: formData,
    headers: {}
  }, useAuth);

// Convenience methods for explicitly authenticated/non-authenticated requests
export const fetchGetAuth = (url) => fetchGet(url, true);
export const fetchGetPublic = (url) => fetchGet(url, false);
export const fetchPostAuth = (url, body) => fetchPost(url, body, true);
export const fetchPostPublic = (url, body) => fetchPost(url, body, false);
