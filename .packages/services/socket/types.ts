import { IChatEventMap } from "../chat/types";

export enum SocketChannelName {
  CHAT = "chat",
}
export enum SocketAction {
  SUBSCRIBE = "subscribe",
  UNSUBSCRIBE = "unsubscribe",
}

export interface ISocketChannelMap {
  [SocketChannelName.CHAT]: IChatEventMap;
}

export interface IIncomingSocketMessage {
  channel: SocketChannelName;
  action: SocketAction;
}
