import { SocketChannel } from "../../tools/socket-pool/socket-channel";
import { SocketClient } from "../../tools/socket/socket-client";
import { SocketChannelName } from "../../tools/socket/types";
import { IChatActionMap, IChatIncomingMessage } from "./types";

export class ChatService extends SocketChannel {
  constructor() {
    super(SocketChannelName.CHAT);
  }

  protected actions: {
    [A in keyof IChatActionMap]: (
      message: IChatActionMap[A],
      client: SocketClient
    ) => void;
  } = {
    send: (message: IChatIncomingMessage, client: SocketClient) =>
      this.onMessage(message, client),
  };

  protected messageValidator: {
    [A in keyof IChatActionMap]: (data: any) => boolean;
  } = {
    send: ChatService.validateIncomingChatMessage,
  };

  private static validateIncomingChatMessage(
    data: any
  ): data is IChatIncomingMessage {
    return data && typeof data === "object" && data.text && data.user?.id;
  }

  onMessage(message: IChatIncomingMessage, client: SocketClient) {
    this.emitAll("message", {
      text: message.text,
      user: { id: message.user.id, name: "anonymous" },
      time: new Date(),
    });
  }
}
