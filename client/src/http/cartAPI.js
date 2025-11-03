import { fetchGetAuth, fetchPostPublic, fetchPostAuth } from "./fetch";

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

export const generateGuestToken = async () => {
  const res = await fetchPostPublic('/cart/guest-token');
  return res
}

export const createStripeCheckout = async (items) => {
  const res = await fetchPostAuth('/checkout/stripe', { items });
  return res
}

export const verifyStripeCheckoutSession = async (sessionId) => {
  const res = await fetchGetAuth(`/checkout/stripe/verify?sessionId=${sessionId}`);
  return res
}

export const createPaypalCheckout = async (items) => {
  const res = await fetchPostAuth('/checkout/paypal', { items });
  return res
}

export const getPaypalOrder = async (orderId) => {
  const res = await fetchGetAuth(`/checkout/paypal/getOrder?orderId=${orderId}`);
  return res
}

export const cancelOrder = async (payload) => {
  const { stripeId, paypalId } = payload
  const data = { ...(paypalId ? { paypalId } : { stripeId }) }
  const res = await fetchPostAuth('/checkout/cancel', data);
  return res
}