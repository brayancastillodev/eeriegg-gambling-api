import { SocketPoolInstance } from "../socket-pool";
import { ISocketChannelEventMap, OutgoingSocketMessage } from "../socket/types";
import { redis } from "./redis";
import { IPubSubEvent } from "./types";

export const PubSub = <
  Channel extends keyof ISocketChannelEventMap = keyof ISocketChannelEventMap
>(
  id: string
) => {
  return {
    subscribe(event?: (data: OutgoingSocketMessage<Channel>) => void) {
      redis.on("message", (_id, message) => {
        if (id !== _id) return;
        const eventData = JSON.parse(message) as IPubSubEvent<Channel>;
        eventData.clientIds.forEach((clientId) => {
          const client = SocketPoolInstance.getClient(clientId);
          client?.send(eventData.data);
        });
        event && event(eventData.data);
      });
      redis.subscribe(id);
    },
    unsubscribe() {
      redis.unsubscribe(id);
    },
    publish(data: OutgoingSocketMessage<Channel>, clientIds: string[]) {
      redis.publish(id, JSON.stringify({ clientIds, data }));
    },
  };
};
