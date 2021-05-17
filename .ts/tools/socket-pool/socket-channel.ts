import * as uuid from "uuid";
import { WebsocketErrorMessage } from "../../helper/error/types";
import { WebsocketError } from "../../helper/error/websocket-error";
import { SocketPoolInstance } from "../../singleton/socket";
import { SocketClient } from "../socket/socket-client";
import {
  IncomingSocketMessage,
  ISocketChannelActionMap,
  ISocketChannelEventMap,
  CommonSocketAction,
  SocketChannelName,
} from "../socket/types";

export class SocketChannel<Channel extends SocketChannelName> {
  private attendees = new Map<string, boolean>();
  public readonly id = uuid.v1();
  constructor(public readonly name: Channel) {}
  protected actions:
    | {
        [A in keyof ISocketChannelActionMap[Channel]]: (
          clientId: string,
          message: ISocketChannelActionMap[Channel][A]
        ) => void;
      }
    | undefined;
  protected messageValidator:
    | {
        [A in keyof ISocketChannelActionMap[Channel]]: (
          data: any
        ) => data is ISocketChannelActionMap[Channel][A];
      }
    | undefined;

  handleAction(message: IncomingSocketMessage<Channel>, clientId: string) {
    const { action, data } = message;
    switch (action) {
      case CommonSocketAction.SUBSCRIBE:
        this.subscribe(clientId);
        return;
      case CommonSocketAction.UNSUBSCRIBE:
        this.unsubscribe(clientId);
        return;
    }
    const validator = this.messageValidator?.[action];
    const handler = this.actions?.[action];
    if (!handler) {
      throw new WebsocketError(WebsocketErrorMessage.INVALID_ACTION);
    }
    if (!data || (validator && !validator(data))) {
      throw new WebsocketError(WebsocketErrorMessage.INVALID_DATA);
    }
    try {
      handler(clientId, data);
    } catch (error) {
      console.error("SocketChannel", this.name, "handleAction", "error", error);
      throw error;
    }
  }

  protected subscribe(clientId: string) {
    this.attendees.set(clientId, true);
  }

  protected unsubscribe(clientId: string) {
    this.attendees.delete(clientId);
  }

  hasJoined(id: string): boolean {
    return !!this.attendees.get(id);
  }

  protected emitAll<T extends keyof ISocketChannelEventMap[Channel]>(
    eventType: T,
    data: ISocketChannelEventMap[Channel][T]
  ) {
    for (const [id, _] of this.attendees) {
      const client = SocketPoolInstance.getClient(id);
      if (!client) this.attendees.delete(id);
      client?.send({ channel: this.name, event: { type: eventType, data } });
    }
  }
}
