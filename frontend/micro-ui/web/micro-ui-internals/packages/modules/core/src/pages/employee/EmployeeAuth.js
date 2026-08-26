export const formatEmployeeAuthUsername = (value) => {
  const username = String(value || "").trim();

  return /^[6-9]\d{9}$/.test(username)
    ? `${username}_`
    : username;
};