import { SocketClient } from "../socket/socket-client";
import WebSocket from "ws";

export class SocketPool {
  private sockets = new Map<string, SocketClient>();

  getClient(id: string): SocketClient {
    const socket = this.sockets.get(id);
    if (!socket) throw new Error(`SocketPool: invalid socket id`);
    return socket;
  }

  newClient(id: string, _socket: WebSocket): SocketClient {
    const socket = new SocketClient(_socket, id, true);
    this.sockets.set(id, socket);
    return socket;
  }

  removeClient(id: string): void {
    this.sockets.delete(id);
  }

  getAllClients(): IterableIterator<SocketClient> {
    return this.sockets.values();
  }

  getClients(ids: string[]): SocketClient[] {
    return ids.map((id) => this.getClient(id));
  }
}
