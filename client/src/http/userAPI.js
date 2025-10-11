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

export const login = async (email, password) => {
  const response = await fetchPostPublic(`/user/login`, { email, password });
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