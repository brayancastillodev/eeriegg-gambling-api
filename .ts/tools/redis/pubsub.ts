import { SocketPoolInstance } from "../socket-pool";
import { ISocketChannelEventMap, OutgoingSocketMessage } from "../socket/types";
import { getRedisClient } from "./redis";
import { IPubSubEvent } from "./types";

const subscriber = getRedisClient(`main:sub`);

export const PubSub = <
  Channel extends keyof ISocketChannelEventMap = keyof ISocketChannelEventMap
>(
  id: string
) => {
  const publisher = getRedisClient(`main:pub:${id}`);
  console.log("PubSub", id, "init");
  return {
    subscribe(event?: (data: OutgoingSocketMessage<Channel>) => void) {
      console.log("PubSub", id, "subscribe");
      subscriber.on("message", (_id, message) => {
        if (id !== _id) return;
        const eventData = JSON.parse(message) as IPubSubEvent<Channel>;
        if (eventData.clientIds) {
          eventData.clientIds.forEach((clientId) => {
            try {
              const client = SocketPoolInstance.getClient(clientId);
              client.send(eventData.data);
            } catch (err) {
              console.log("PubSub", id, "skip client on send", clientId);
            }
          });
        } else {
          for (const client of SocketPoolInstance.getAllClients()) {
            client.send(eventData.data);
          }
        }
        event && event(eventData.data);
      });
      subscriber.subscribe(id);
    },
    unsubscribe() {
      subscriber.unsubscribe(id);
    },
    async publish<T extends keyof ISocketChannelEventMap>(
      data: OutgoingSocketMessage<T, keyof ISocketChannelEventMap[T]>
    ) {
      const clientIds = await publisher.keys("*");
      publisher.publish(id, JSON.stringify({ clientIds, data }));
    },
    join(clientId: string) {
      publisher.set(clientId, JSON.stringify({ username: clientId }));
    },
    leave(clientId: string) {
      publisher.del(clientId);
    },
  };
};
