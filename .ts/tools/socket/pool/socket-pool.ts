import { SocketClient } from "../socket-client";
import WebSocket from "ws";
import { WebsocketError } from "../../../helper/error/websocket-error";
import { WebsocketErrorMessage } from "../../../helper/error/types";

export class SocketPool {
  private sockets = new Map<string, SocketClient>();

  getClient(id: string): SocketClient {
    const socket = this.sockets.get(id);
    if (!socket) throw new WebsocketError(WebsocketErrorMessage.UNKNOWN_CLIENT);
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
    const clients: SocketClient[] = [];
    ids.forEach((id) => {
      const client = this.sockets.get(id);
      if (client) clients.push(client);
    });
    return clients;
  }
}
