import { ChatService } from "../../services/chat/chat";
import { SocketClient } from "./socket-client";
import { SocketChannelName } from "./types";
import { messageParser } from "./message-parser";
import { WebsocketError } from "../../helper/error/websocket-error";
import { WebsocketErrorMessage } from "../../helper/error/types";
import {
  SocketPoolInstance,
  SocketServiceInstance,
} from "../../singleton/socket";
import { GeneralService } from "../../services/general/general";

export class SocketService {
  private channels = {
    [SocketChannelName.CHAT]: new ChatService(),
    [SocketChannelName.GENERAL]: new GeneralService(),
  };

  handleIncomingMessage(message: string, clientId: string) {
    let client: SocketClient | undefined;
    try {
      const parsedMessage = messageParser(message);
      const channel = this.channels[parsedMessage.channel];
      channel.handleAction(parsedMessage, clientId);
    } catch (error) {
      console.warn("SocketService", "handleIncomingMessage", "error", error);
      if (
        error instanceof WebsocketError &&
        error.message !== WebsocketErrorMessage.UNKNOWN_CLIENT
      ) {
        client = SocketPoolInstance.getClient(clientId);
      }
      client?.send({
        code: error?.code || undefined,
        error: error?.message || "unknown error",
      });
    }
  }
}
