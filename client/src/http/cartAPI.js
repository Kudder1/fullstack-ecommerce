import { fetchGetAuth, fetchPostAuth } from "./fetch";

export const createCart = async (questBasket) => {
  const res = await fetchPostAuth(`/cart`, { questBasket });
  return res
}

export const getCart = async () => {
  const res = await fetchGetAuth(`/cart`);
  localStorage.setItem('cart', JSON.stringify(res));
  return res
}

export const addToCart = async (deviceId, quantity = 1) => {
  const res = await fetchPostAuth(`/cart/add`, { deviceId, quantity });
  localStorage.setItem('cart', JSON.stringify(res));
  return res
}

export const updateCart = async (deviceId, quantity) => {
  const res = await fetchPostAuth(`/cart/update`, { deviceId, quantity });
  localStorage.setItem('cart', JSON.stringify(res));
  return res
}