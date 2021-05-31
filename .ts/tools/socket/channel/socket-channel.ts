import * as uuid from "uuid";
import { WebsocketErrorMessage } from "../../../helper/error/types";
import { WebsocketError } from "../../../helper/error/websocket-error";
import { PubSub } from "../../redis";
import { PubSub as PubSubRedis } from "../../redis/pubsub";
import { PubSubMock } from "../../redis/pubsub-mock";
import {
  IncomingSocketMessage,
  ISocketChannelActionMap,
  ISocketChannelEventMap,
  CommonSocketAction,
  SocketChannelName,
} from "../types";

export class SocketChannel<Channel extends SocketChannelName> {
  public readonly id = uuid.v1();
  protected pubsub!: PubSubRedis | PubSubMock;

  protected onSubscribe: ((clientId: string) => void) | undefined;

  protected onUnsubscribe: ((clientId: string) => void) | undefined;

  constructor(public readonly name: Channel) {
    this.pubsub = new PubSub(name);
    this.pubsub.subscribe();
  }

  protected actions:
    | {
        [A in keyof ISocketChannelActionMap[Channel]]: (
          clientId: string,
          message: ISocketChannelActionMap[Channel][A]
        ) => Promise<void>;
      }
    | undefined;
  protected messageValidator:
    | {
        [A in keyof ISocketChannelActionMap[Channel]]: (
          data: any
        ) => data is ISocketChannelActionMap[Channel][A];
      }
    | undefined;

  public async handleAction(
    message: IncomingSocketMessage<Channel>,
    clientId: string
  ) {
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
      await handler(clientId, data);
    } catch (error) {
      console.error("SocketChannel", this.name, "handleAction", "error", error);
      throw error;
    }
  }

  public async hasJoined(clientId: string): Promise<boolean> {
    return this.pubsub.hasJoined(clientId);
  }

  public async subscribe(clientId: string) {
    await this.pubsub.join(clientId);
    this.onSubscribe && this.onSubscribe(clientId);
  }

  public async unsubscribe(clientId: string) {
    const hasJoined = await this.pubsub.hasJoined(clientId);
    if (hasJoined) {
      await this.pubsub.leave(clientId);
      this.onUnsubscribe && this.onUnsubscribe(clientId);
    }
  }

  protected async publish<T extends keyof ISocketChannelEventMap[Channel]>(
    eventType: T,
    data: ISocketChannelEventMap[Channel][T]
  ) {
    await this.pubsub.publish({
      channel: this.name,
      event: { type: eventType, data },
    });
  }
}
