import { SocketPool } from "../services/socket-pool/socket-pool";
import { SocketService } from "../services/socket/socket-service";

export const SocketPoolInstance = new SocketPool();
export const SocketServiceInstance = new SocketService();
