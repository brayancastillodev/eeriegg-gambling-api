import { SocketChannel, SocketChannelName } from "../../tools/socket";
import { IChatActionMap, IChatIncomingMessage } from "./types";

export class ChatChannel extends SocketChannel<SocketChannelName.CHAT> {
  constructor() {
    super(SocketChannelName.CHAT);
  }

  protected actions: {
    [A in keyof IChatActionMap]: (
      clientId: string,
      message: IChatActionMap[A]
    ) => Promise<void>;
  } = {
    send: async (clientId: string, message: IChatIncomingMessage) =>
      this.onMessage(clientId, message),
  };

  protected messageValidator: {
    [A in keyof IChatActionMap]: (data: any) => data is IChatActionMap[A];
  } = {
    send: ChatChannel.validateIncomingChatMessage,
  };

  private static validateIncomingChatMessage(
    data: any
  ): data is IChatIncomingMessage {
    return data && typeof data === "object" && data.text;
  }

  protected onSubscribe: (clientId: string) => void = (clientId: string) => {
    this.publish("joined", {
      userId: clientId,
      time: new Date(),
    });
  };

  protected onUnsubscribe: (clientId: string) => void = (clientId: string) => {
    this.publish("left", {
      userId: clientId,
      time: new Date(),
    });
  };

  onMessage(clientId: string, message: IChatIncomingMessage) {
    this.publish("message", {
      text: message.text,
      user: { id: "id", name: "anonymous" },
      time: new Date(),
    });
  }
}
