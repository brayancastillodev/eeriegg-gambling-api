import { SocketPoolInstance } from "../socket/pool";
import { ISocketChannelEventMap, OutgoingSocketMessage } from "../socket/types";

export type EventCallback<DataType> = (data: DataType) => void;

/**
 * Standard event emitter class
 */
export class PubSubMock<
  Channel extends keyof ISocketChannelEventMap = keyof ISocketChannelEventMap
> {
  // public readonly listeners = new Map<keyof EventMap, EventCallback<EventMap[keyof EventMap]>[]>()
  public readonly listeners: {
    [clientId: string]: boolean;
  } = {};
  constructor(public readonly id: string) {
    console.log("PubSubMock", id, "init");
  }

  subscribe(event?: (data: OutgoingSocketMessage<Channel>) => void) {
    console.log("PubSubMock", this.id, "subscribe");
  }

  async unsubscribe() {}

  async hasJoined(clientId: string): Promise<boolean> {
    const client = this.listeners[clientId];
    return !!client;
  }

  public join = async (clientId: string) => {
    this.listeners[clientId] = true;
  };

  on(channel: string, event: (message: string) => void) {}

  public leave = async (clientId: string) => {
    delete this.listeners[clientId];
  };

  async publish<T extends keyof ISocketChannelEventMap>(
    data: OutgoingSocketMessage<T, keyof ISocketChannelEventMap[T]>
  ) {
    Object.keys(this.listeners).forEach((clientId) => {
      try {
        const client = SocketPoolInstance.getClient(clientId);
        client.send(data);
      } catch (err) {
        console.log("PubsubMock", "skip client", clientId);
      }
    });
  }
}
