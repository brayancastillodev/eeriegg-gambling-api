import { SocketHandler } from "../tools/socket/socket-handler";

export const runApplication = (strapi: any): void => {
  new SocketHandler(strapi);
};
