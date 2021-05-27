import { WebsocketErrorMessage } from "../../helper/error/types";
import { IChatActionMap, IChatEventMap } from "../../services/chat/types";
import {
  ICoinFlipActionMap,
  ICoinFlipEventMap,
} from "../../services/coin-flip/types";
import {
  IGeneralActionMap,
  IGeneralEventMap,
} from "../../services/general/types";

export enum SocketChannelName {
  CHAT = "chat",
  GENERAL = "general",
  COIN_FLIP = "coin_flip",
}

export enum CommonSocketAction {
  SUBSCRIBE = "subscribe",
  UNSUBSCRIBE = "unsubscribe",
}
export interface ISocketChannelEventMap {
  [SocketChannelName.GENERAL]: IGeneralEventMap;
  [SocketChannelName.CHAT]: IChatEventMap;
  [SocketChannelName.COIN_FLIP]: ICoinFlipEventMap;
}
export interface ISocketChannelActionMap {
  [SocketChannelName.CHAT]: IChatActionMap;
  [SocketChannelName.GENERAL]: IGeneralActionMap;
  [SocketChannelName.COIN_FLIP]: ICoinFlipActionMap;
}

export type IncomingSocketMessage<
  C extends SocketChannelName = SocketChannelName,
  A extends keyof ISocketChannelActionMap[C] = keyof ISocketChannelActionMap[C]
> =
  | {
      channel: C;
      action: A;
      data: ISocketChannelActionMap[C][A];
    }
  | {
      channel: SocketChannelName;
      action: CommonSocketAction;
      data: undefined;
    };

export type OutgoingSocketMessage<
  C extends SocketChannelName = SocketChannelName,
  E extends keyof ISocketChannelEventMap[C] = keyof ISocketChannelEventMap[C]
> = {
  channel: C;
  event: {
    type: E;
    data: ISocketChannelEventMap[C][E];
  };
};

export interface IWebsocketErrorMessage {
  error: WebsocketErrorMessage;
  code: number | undefined;
}
