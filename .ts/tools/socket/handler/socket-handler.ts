import { SocketClient } from "../socket-client";
import { SocketChannelName } from "../types";
import { messageParser } from "../../../helper/parser/socket-message-parser";
import { WebsocketError } from "../../../helper/error/websocket-error";
import { WebsocketErrorMessage } from "../../../helper/error/types";
import { SocketPoolInstance } from "../pool";
import { ChatServiceInstance } from "../../../channels/chat";
import { GeneralServiceInstance } from "../../../channels/general";
import { CoinFlipServiceInstance } from "../../../channels/coin-flip";

export class SocketHandler {
  private channels = {
    [SocketChannelName.CHAT]: ChatServiceInstance,
    [SocketChannelName.GENERAL]: GeneralServiceInstance,
    [SocketChannelName.COIN_FLIP]: CoinFlipServiceInstance,
  };

  public async handleIncomingMessage(message: string, clientId: string) {
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

  public async unsubscribeClientFromAllChannels(clientId: string) {
    const promises = Object.values(this.channels).map(async (channel) =>
      channel.unsubscribe(clientId)
    );
    await Promise.all(promises);
  }
}
