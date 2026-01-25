export const imgSrc = (value, API_BASE_URL) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  return `${API_BASE_URL}/uploads/${value}`;
};
