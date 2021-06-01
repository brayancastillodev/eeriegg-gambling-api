import uuid from "uuid";
import { getRedisClient } from "../redis/redis";
import { IPubSubEvent } from "../redis/types";
import { ISocketChannelEventMap, OutgoingSocketMessage } from "../socket";
export class GameManager<
  Channel extends keyof ISocketChannelEventMap = keyof ISocketChannelEventMap
> {
  constructor(public readonly id: Channel) {
    console.log("GameManager", id, "init");
  }
  private publisher = getRedisClient(`main:game:${this.id}`);

  async publish<T extends keyof ISocketChannelEventMap[Channel]>(
    gameId: string,
    type: T,
    data: ISocketChannelEventMap[Channel][T]
  ) {
    const clientIds = await this.publisher.lrange(gameId, 0, -1);
    const event: IPubSubEvent<Channel> = {
      clientIds: clientIds || [],
      data: {
        channel: this.id,
        event: {
          type,
          data,
        },
      },
    };
    this.publisher.publish(this.id, JSON.stringify(event));
  }
  async join(gameId: string, clientId: string) {
    await this.publisher.lpush(gameId, clientId);
  }
  async leave(gameId: string, clientId: string) {
    await this.publisher.lrem(gameId, 0, clientId);
  }
  async remove(gameId: string) {
    await this.publisher.del(gameId);
  }
  async create(clientId: string): Promise<string> {
    const gameId = uuid.v4();
    await this.join(gameId, clientId);
    return gameId;
  }
  async list(): Promise<string[]> {
    return this.publisher.keys("*");
  }
  async hasJoined(gameId: string, clientId: string): Promise<boolean> {
    const client = await this.publisher.scan(gameId, "MATCH", clientId);
    return !!client;
  }
}
