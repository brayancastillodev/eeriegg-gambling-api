import { ChatService } from "../chat/chat";
import { SocketClient } from "./socket-client";
import { SocketAction, SocketChannelName } from "./types";
import { messageParser } from "./message-parser";

export class SocketService {
  private channels = {
    [SocketChannelName.CHAT]: new ChatService(SocketChannelName.CHAT),
  };

  handleIncomingMessage(client: SocketClient, message: string) {
    const { channel, action } = messageParser(message);
    const app = this.channels[channel];
    switch (action) {
      case SocketAction.SUBSCRIBE:
        app.join(client);
        break;
      case SocketAction.SUBSCRIBE:
        app.leave(client);
        break;
      default:
        console.error("fatal error", "unknown action", action);
    }
  }
}
