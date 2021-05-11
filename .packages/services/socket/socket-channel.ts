import { SocketPoolInstance } from "../../singleton";
import { SocketClient } from "./socket-client";
import { ISocketChannelMap, SocketChannelName } from "./types";

export class SocketChannel {
  constructor(public readonly name: SocketChannelName) {}
  public readonly room = SocketPoolInstance.newRoom<
    ISocketChannelMap[SocketChannelName]
  >(this.name);

  protected subscribe(socket: SocketClient) {
    this.room.join(socket.id);
  }

  protected unsubscribe(socket: SocketClient) {
    this.room.leave(socket.id);
  }

  protected emitAll<T extends keyof ISocketChannelMap[SocketChannelName]>(
    event: T,
    data: ISocketChannelMap[SocketChannelName][T]
  ) {
    this.room.emit(event, data);
  }
}
