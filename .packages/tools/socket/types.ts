import { WebsocketErrorMessage } from "../../helper/error/types";
import { IChatActionMap, IChatEventMap } from "../../services/chat/types";

export enum SocketChannelName {
  CHAT = "chat",
}
export enum GeneralSocketAction {
  SUBSCRIBE = "subscribe",
  UNSUBSCRIBE = "unsubscribe",
}

export interface ISocketChannelEventMap {
  [SocketChannelName.CHAT]: IChatEventMap;
}
export interface ISocketChannelActionMap {
  [SocketChannelName.CHAT]: IChatActionMap;
}

export type IncomingSocketMessage<
  T extends keyof ISocketChannelActionMap[SocketChannelName] = keyof ISocketChannelActionMap[SocketChannelName]
> =
  | {
      channel: SocketChannelName;
      action: T;
      data: ISocketChannelActionMap[SocketChannelName][T];
    }
  | {
      channel: SocketChannelName;
      action: GeneralSocketAction;
      data: undefined;
    };

export type OutgoingSocketMessage = {
  channel: SocketChannelName;
  event: {
    type: keyof ISocketChannelEventMap[SocketChannelName];
    data: ISocketChannelEventMap[SocketChannelName][keyof ISocketChannelEventMap[SocketChannelName]];
  };
};

export interface IWebsocketErrorMessage {
  message: WebsocketErrorMessage;
  error: true;
}
