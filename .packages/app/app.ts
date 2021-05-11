import { SocketHandler } from "../services/socket/socket-handler";

export const runApplication = (strapi: any): void => {
  const socketHandler = new SocketHandler("default", strapi);
};
