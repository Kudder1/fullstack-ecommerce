import { getLocalCart } from "../utils/helpers";
import { createCart } from "./cartAPI";
import { fetchGetAuth, fetchPostPublic } from "./fetch";
import { jwtDecode } from "jwt-decode";

const processResponse = async (response) => {
  localStorage.setItem('token', response.token);
  await createCart(getLocalCart())
  return jwtDecode(response.token);
}

export const registration = async (email, password) => {
  const response = await fetchPostPublic(`/user/registration`, { email, password });
  return processResponse(response)
}

export const verifyEmail = async (token) => {
  const response = await fetchGetAuth(`/user/verify-email?token=${token}`);
  return response;
}

export const reverifyEmail = async () => {
  const response = await fetchGetAuth(`/user/reverify-email`);
  return response;
}

export const recoverPassword = async (email) => {
  const response = await fetchPostPublic(`/user/recover-password`, { email });
  return response;
}

export const newPassword = async (password1, password2, token) => {
  const response = await fetchPostPublic(`/user/new-password?token=${token}`, { password1, password2 });
  localStorage.setItem('token', response.token);
  return {
    user: jwtDecode(response.token),
    message: response.message
  };
}

export const login = async (email, password) => {
  const response = await fetchPostPublic(`/user/login`, { email, password });
  return processResponse(response)
}

export const loginGoogle = async (code) => {
  const response = await fetchPostPublic(`/user/login-google`, { code });
  return processResponse(response)
}


export const check = async () => {
  try {
    const response = await fetchGetAuth(`/user/auth`);
    localStorage.setItem('token', response.token);
    return jwtDecode(response.token);
  } catch {
    localStorage.removeItem('token');
  }
}