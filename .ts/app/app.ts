import { SocketService } from "../tools/socket/socket-service";

export const runApplication = (strapi: any): void => {
  new SocketService(strapi);
};
