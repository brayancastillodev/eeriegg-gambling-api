import { SocketService } from "../services/socket/socket-service";

export const runApplication = (): void => {
  new SocketService();
};
