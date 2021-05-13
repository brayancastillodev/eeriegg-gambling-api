import { ChatService } from "../../services/chat/chat";
import { SocketClient } from "./socket-client";
import { SocketChannelName } from "./types";
import { messageParser } from "./message-parser";

export class SocketService {
  private channels = {
    [SocketChannelName.CHAT]: new ChatService(),
  };

  handleIncomingMessage(client: SocketClient, message: string) {
    const parsedMessage = messageParser(message);
    const channel = this.channels[parsedMessage.channel];
    try {
      channel.handleAction(parsedMessage, client);
    } catch (error) {
      client.send({ error: true, message: error?.message || "unknown error" });
    }
  }
}
