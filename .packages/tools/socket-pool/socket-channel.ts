import * as uuid from "uuid";
import { WebsocketErrorMessage } from "../../helper/error/types";
import { WebsocketError } from "../../helper/error/websocket-error";
import { SocketPoolInstance } from "../../singleton/socket";
import { SocketClient } from "../socket/socket-client";
import {
  IncomingSocketMessage,
  ISocketChannelActionMap,
  ISocketChannelEventMap,
  GeneralSocketAction,
  SocketChannelName,
} from "../socket/types";

export class SocketChannel {
  private attendees = new Map<string, boolean>();
  public readonly id = uuid.v1();
  constructor(public readonly name: SocketChannelName) {}
  protected actions:
    | {
        [A in keyof ISocketChannelActionMap[SocketChannelName]]: (
          message: ISocketChannelActionMap[SocketChannelName][A],
          client: SocketClient
        ) => void;
      }
    | undefined;
  protected messageValidator:
    | {
        [A in keyof ISocketChannelActionMap[SocketChannelName]]: (
          data: any
        ) => boolean;
      }
    | undefined;

  handleAction(message: IncomingSocketMessage, client: SocketClient) {
    const { action, data } = message;
    switch (action) {
      case GeneralSocketAction.SUBSCRIBE:
        this.subscribe(client);
        return;
      case GeneralSocketAction.UNSUBSCRIBE:
        this.unsubscribe(client);
        return;
    }
    const validator = this.messageValidator?.[action];
    const handler = this.actions?.[action];
    if (!handler) {
      throw new WebsocketError(WebsocketErrorMessage.INVALID_ACTION);
    }
    if (validator) {
      const isValidData = validator(data);
      if (!isValidData)
        throw new WebsocketError(WebsocketErrorMessage.INVALID_DATA);
    }
    try {
      handler(data!, client);
    } catch (error) {
      console.error("SocketChannel", this.name, "handleAction", "error", error);
    }
  }

  protected subscribe(client: SocketClient) {
    this.attendees.set(client.id, true);
  }

  protected unsubscribe(client: SocketClient) {
    this.attendees.delete(client.id);
  }

  hasJoined(id: string): boolean {
    return !!this.attendees.get(id);
  }

  protected emitAll<T extends keyof ISocketChannelEventMap[SocketChannelName]>(
    eventType: T,
    data: ISocketChannelEventMap[SocketChannelName][T]
  ) {
    for (const [id, _] of this.attendees) {
      const client = SocketPoolInstance.getClient(id);
      client.send({ channel: this.name, event: { type: eventType, data } });
    }
  }
}
