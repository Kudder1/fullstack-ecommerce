import { getLocalCart } from "../utils/helpers";
import { fetchGetAuth, fetchPostAuth, fetchPostPublic } from "./fetch";
import { jwtDecode } from "jwt-decode";
import userStore from '../store/UserStore';

const processResponse = async (response) => {
  userStore.setAccessToken(response.accessToken);
  return jwtDecode(response.accessToken);
}

export const registration = async (email, password) => {
  const response = await fetchPostPublic(`/user/registration`, { email, password, questBasket: getLocalCart() });
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
  userStore.setAccessToken(response.accessToken)
  return {
    user: jwtDecode(response.token),
    message: response.message
  };
}

export const login = async (email, password) => {
  const response = await fetchPostPublic(`/user/login`, { email, password, questBasket: getLocalCart() });
  return processResponse(response)
}

export const loginGoogle = async (code) => {
  const response = await fetchPostPublic(`/user/login-google`, { code, questBasket: getLocalCart() });
  return processResponse(response)
}

export const refresh = async () => {
  const response = await fetchPostAuth('/user/refresh');
  return processResponse(response)
}

export const logout = async () => {
  await fetchPostAuth('/user/logout');
  userStore.logout()
}