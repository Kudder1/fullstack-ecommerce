import { fetchGetAuth, fetchPostAuth } from "./fetch";

export const createCart = async () => {
  const res = await fetchPostAuth(`/cart`);
  return res
}

export const getCart = async () => {
  const res = await fetchGetAuth(`/cart`);
  return res
}

export const addToCart = async (deviceId, quantity = 1) => {
  const res = await fetchPostAuth(`/cart/add`, { deviceId, quantity });
  return res
}

export const updateCart = async (deviceId, quantity) => {
  const res = await fetchPostAuth(`/cart/update`, { deviceId, quantity });
  return res
}