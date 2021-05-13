import { SocketPool } from "../tools/socket-pool/socket-pool";
import { SocketService } from "../tools/socket/socket-service";

export const SocketPoolInstance = new SocketPool();
export const SocketServiceInstance = new SocketService();
