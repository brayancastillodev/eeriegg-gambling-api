import { SocketPoolInstance } from "../../singleton";
import { SocketChannel } from "../socket/socket-channel";
import { SocketClient } from "../socket/socket-client";
import { SocketService } from "../socket/socket-service";
import { IChatEventMap } from "./types";

export class ChatService extends SocketChannel {

  join(client: SocketClient) {
    return this.room.join(client.id);
  }

  leave(client: SocketClient) {
    return this.room.leave(client.id);
  }
}
