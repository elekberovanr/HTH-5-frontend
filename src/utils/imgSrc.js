import { API_BASE_URL } from "../config/apiBase";

export const imgSrc = (value, fallback = "") => {
  if (!value) return fallback;

  // cloudinary və ya başqa tam link
  if (typeof value === "string" && value.startsWith("http")) return value;

  // köhnə sistem: filename gəlirsə
  return `${API_BASE_URL}/uploads/${value}`;
};
