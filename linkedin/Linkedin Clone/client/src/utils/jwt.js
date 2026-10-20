export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const getUserIdFromToken = (token) => {
  const decoded = decodeToken(token);
  return decoded?.id || null;
};
