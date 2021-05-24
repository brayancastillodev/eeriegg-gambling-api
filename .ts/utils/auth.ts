export const verifyToken = (token: string): Promise<{ id: string; isAdmin: boolean }> => {
  return strapi.plugins["users-permissions"].services.jwt.verify(token);
};
