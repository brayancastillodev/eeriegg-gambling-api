import { SocketClient } from "../socket/socket-client";
import WebSocket from "ws";
import { SocketRoom } from "./socket-room";

export class SocketPool {
  private sockets = new Map<string, SocketClient>();
  private rooms = new Map<string, SocketRoom<any>>();

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

  getClients(): IterableIterator<SocketClient> {
    return this.sockets.values();
  }

  newRoom<T>(name: string): SocketRoom<T> {
    const room = new SocketRoom(name);
    this.rooms.set(room.id, room);
    return room;
  }

  removeRoom(id: string): void {
    this.rooms.delete(id);
  }

  getRoom<T>(id: string): SocketRoom<T> {
    const room = this.rooms.get(id);
    if (!room) throw new Error(`SocketPool: invalid room id`);
    return room;
  }
}
