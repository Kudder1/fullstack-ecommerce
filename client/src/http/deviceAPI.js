import { appendToFormData } from "../utils/dataUtils";
import { fetchGetPublic, fetchPostAuth, fetchPostForm } from "./fetch";

export const createType = async (type) => {
  const res = await fetchPostAuth(`/type`, type);
  return res
}
export const fetchTypes = async () => {
  return await fetchGetPublic(`/type`);
}

export const createBrand = async (brand) => {
  const res = await fetchPostAuth(`/brand`, brand);
  return res
}
export const fetchBrands = async () => {
  return await fetchGetPublic(`/brand`);
}

export const createDevice = async (device) => {
  const formData = appendToFormData(device);
  const res = await fetchPostForm(`/device`, formData);
  return res
}
export const fetchDevices = async (typeId, brandId, page, limit = 5) => {
  let url = `/device?page=${page}&limit=${limit}`;
  if (typeId) url += `&typeId=${typeId}`;
  if (brandId) url += `&brandId=${brandId}`;
  const res = await fetchGetPublic(url);
  return res
}
export const fetchOneDevice = async (id) => {
  return await fetchGetPublic(`/device/${id}`);
}

export const rateDevice = async (deviceId, rate) => {
  return await fetchPostAuth(`/rating`, { deviceId, rate });
}