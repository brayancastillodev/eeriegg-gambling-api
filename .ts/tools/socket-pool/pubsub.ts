import { ISocketChannelEventMap, SocketChannelName } from "../socket/types";

export const PubSub = {
  subscribe(channel: SocketChannelName) {},
  publish(
    channel: SocketChannelName,
    data: ISocketChannelEventMap[SocketChannelName]
  ) {},
};
