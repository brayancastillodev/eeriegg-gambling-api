import { IUserModel } from "../models";

export const getUser = async (
  userId: string
): Promise<IUserModel | undefined> => {
  const user = await strapi
    .query("user", "users-permissions")
    .findOne({ id: userId });

  return user;
};
