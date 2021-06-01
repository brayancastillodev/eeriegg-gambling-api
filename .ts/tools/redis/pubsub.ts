import { SocketPoolInstance } from "../socket/pool";
import { ISocketChannelEventMap, OutgoingSocketMessage } from "../socket/types";
import { getRedisClient, subscriber } from "./redis";
import { IPubSubEvent } from "./types";

export class PubSub<
  Channel extends keyof ISocketChannelEventMap = keyof ISocketChannelEventMap
> {
  constructor(public readonly id: string) {
    console.log("PubSub", id, "init");
  }
  private publisher = getRedisClient(`main:pub:${this.id}`);
  subscribe(event?: (data: IPubSubEvent<Channel>) => void) {
    console.log("PubSub", this.id, "subscribe");
    subscriber.on("message", (_id, message) => {
      if (this.id !== _id) return;
      const eventData = JSON.parse(message) as IPubSubEvent<Channel>;
      if (eventData.clientIds) {
        eventData.clientIds.forEach((clientId) => {
          try {
            const client = SocketPoolInstance.getClient(clientId);
            client.send(eventData.data);
          } catch (err) {
            console.log("PubSub", this.id, "skip client on send", clientId);
          }
        });
      } else {
        for (const client of SocketPoolInstance.getAllClients()) {
          client.send(eventData.data);
        }
      }
      event && event(eventData);
    });
    subscriber.subscribe(this.id);
  }
  unsubscribe() {
    subscriber.unsubscribe(this.id);
  }
  async publish<T extends keyof ISocketChannelEventMap>(
    data: OutgoingSocketMessage<T, keyof ISocketChannelEventMap[T]>
  ) {
    const clientIds = await this.publisher.keys("*");
    this.publisher.publish(this.id, JSON.stringify({ clientIds, data }));
  }
  async join(clientId: string) {
    await this.publisher.set(clientId, JSON.stringify({ username: clientId }));
  }
  async leave(clientId: string) {
    await this.publisher.del(clientId);
  }

  async hasJoined(clientId: string): Promise<boolean> {
    const client = await this.publisher.get(clientId);
    return !!client;
  }
}
