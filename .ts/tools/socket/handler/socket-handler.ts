import { SocketClient } from "../client/socket-client";
import { SocketChannelName } from "../types";
import { messageParser } from "../../../helper/parser/socket-message-parser";
import { WebsocketError } from "../../../helper/error/websocket-error";
import { WebsocketErrorMessage } from "../../../helper/error/types";
import { SocketPoolInstance } from "../pool";
import { ChatChannelInstance } from "../../../channels/chat";
import { GeneralChannelInstance } from "../../../channels/general";
import { CoinFlipChannelInstance } from "../../../channels/coin-flip";

export class SocketHandler {
  private channels = {
    [SocketChannelName.CHAT]: ChatChannelInstance,
    [SocketChannelName.GENERAL]: GeneralChannelInstance,
    [SocketChannelName.COIN_FLIP]: CoinFlipChannelInstance,
  };

  public async handleIncomingMessage(message: string, clientId: string) {
    let client: SocketClient | undefined;
    try {
      const parsedMessage = messageParser(message);
      const channel = this.channels[parsedMessage.channel];
      if (channel.auth) {
        client = SocketPoolInstance.getClient(clientId);
        client.user; // check if client authenticated
      }
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
