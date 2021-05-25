import { SocketClient } from "./socket-client";
import {
  ISocketChannelEventMap,
  OutgoingSocketMessage,
  SocketChannelName,
} from "./types";
import { messageParser } from "./message-parser";
import { WebsocketError } from "../../helper/error/websocket-error";
import { WebsocketErrorMessage } from "../../helper/error/types";
import { SocketPoolInstance } from "../socket-pool";
import { ChatServiceInstance } from "../../services/chat";
import { GeneralServiceInstance } from "../../services/general";

export class SocketService {
  private channels = {
    [SocketChannelName.CHAT]: ChatServiceInstance,
    [SocketChannelName.GENERAL]: GeneralServiceInstance,
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

  handlePublish(channel: string, message: string) {
    const json = JSON.parse(message);

  }
}
