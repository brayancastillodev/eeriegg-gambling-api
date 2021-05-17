import { SocketChannel } from "../../tools/socket-pool/socket-channel";
import { SocketChannelName } from "../../tools/socket/types";
import { IChatActionMap, IChatIncomingMessage } from "./types";

export class ChatService extends SocketChannel<SocketChannelName.CHAT> {
  constructor() {
    super(SocketChannelName.CHAT);
  }

  protected actions: {
    [A in keyof IChatActionMap]: (
      clientId: string,
      message: IChatActionMap[A]
    ) => void;
  } = {
    send: (clientId: string, message: IChatIncomingMessage) =>
      this.onMessage(clientId, message),
  };

  protected messageValidator: {
    [A in keyof IChatActionMap]: (data: any) => data is IChatActionMap[A];
  } = {
    send: ChatService.validateIncomingChatMessage,
  };

  private static validateIncomingChatMessage(
    data: any
  ): data is IChatIncomingMessage {
    return data && typeof data === "object" && data.text && data.user?.id;
  }

  onMessage(clientId: string, message: IChatIncomingMessage) {
    this.emitAll("message", {
      text: message.text,
      user: { id: "id", name: "anonymous" },
      time: new Date(),
    });
  }
}
