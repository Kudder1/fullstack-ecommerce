import { createCart } from "./cartAPI";
import { fetchGetAuth, fetchPostPublic } from "./fetch";
import { jwtDecode } from "jwt-decode";

export const registration = async (email, password) => {
  const response = await fetchPostPublic(`/user/registration`, { email, password });
  localStorage.setItem('token', response.token);
  return jwtDecode(response.token);
}

export const login = async (email, password) => {
  const response = await fetchPostPublic(`/user/login`, { email, password });
  localStorage.setItem('token', response.token);
  await createCart()
  return jwtDecode(response.token);
}

export const check = async () => {
  const response = await fetchGetAuth(`/user/auth`);
  localStorage.setItem('token', response.token);
  return jwtDecode(response.token);
}