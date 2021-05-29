import { SocketClient } from "./socket-client";
import { SocketChannelName } from "./types";
import { messageParser } from "./message-parser";
import { WebsocketError } from "../../helper/error/websocket-error";
import { WebsocketErrorMessage } from "../../helper/error/types";
import { SocketPoolInstance } from "../socket-pool";
import { ChatServiceInstance } from "../../services/chat";
import { GeneralServiceInstance } from "../../services/general";
import { CoinFlipServiceInstance } from "../../services/coin-flip";

export class SocketService {
  private channels = {
    [SocketChannelName.CHAT]: ChatServiceInstance,
    [SocketChannelName.GENERAL]: GeneralServiceInstance,
    [SocketChannelName.COIN_FLIP]: CoinFlipServiceInstance,
  };

  async handleIncomingMessage(message: string, clientId: string) {
    let client: SocketClient | undefined;
    try {
      const parsedMessage = messageParser(message);
      const channel = this.channels[parsedMessage.channel];
      await channel.handleAction(parsedMessage, clientId);
    } catch (error) {
      console.warn("SocketService", "handleIncomingMessage", "error", error);
      if (
        error instanceof WebsocketError &&
        error.message !== WebsocketErrorMessage.UNKNOWN_CLIENT
      ) {
        client = SocketPoolInstance.getClient(clientId);
      }
      client?.send({
        code: error?.code || 1,
        error: error?.message || "unknown error",
      });
    }
  }

  unsubscribeClientFromAllChannels(clientId: string) {
    Object.values(this.channels).forEach((channel) =>
      channel.unsubscribe(clientId)
    );
  }
}
