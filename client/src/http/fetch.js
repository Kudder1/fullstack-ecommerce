import userStore from '../store/UserStore';

export const API_URL = import.meta.env.VITE_API_URL;

const fetchWrapper = async (url, options = {}, useAuth = true, isRetry = false) => {
  const headers = {
    // 'Content-Type': 'application/json',
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (useAuth) {
    const token = userStore?.accessToken;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const requestOptions = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(API_URL + url, requestOptions);
  if (!response.ok) {
    const error = await response.json();
    if (response.status === 401 && !isRetry && !url.endsWith('/user/refresh')) {
      const refreshResponse = await fetch(API_URL + '/user/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      if (!refreshResponse.ok) {
        userStore.logout()
        throw new Error('Unauthorized');
      }
      const { accessToken } = await refreshResponse.json();
      userStore.setAccessToken(accessToken);
      return fetchWrapper(url, options, useAuth, true);
    }
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
