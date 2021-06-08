import { RedisStore, IPubSubEvent } from "../redis";
import { connectRedisClient } from "../redis/client/redis";
import { ISocketChannelEventMap } from "../socket";

export class GameManager<
  Channel extends keyof ISocketChannelEventMap = keyof ISocketChannelEventMap,
  GameState extends { lastUpdate: Date; id: string } = any,
  GameProps = any
> extends RedisStore<GameState, GameProps> {
  private publisher = connectRedisClient(`pub:game:${this.id}`);
  constructor(public readonly id: Channel) {
    super(id);
    console.log("GameManager", id, "init");
  }

  async publish<
    T extends keyof ISocketChannelEventMap[Channel] = keyof ISocketChannelEventMap[Channel]
  >(gameId: string, type: T, data: ISocketChannelEventMap[Channel][T]) {
    const event: IPubSubEvent<Channel> = {
      clientIds: await this.getPlayers(gameId),
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
  async create(
    gameId: string,
    clientId: string,
    state: Omit<GameState, "lastUpdate">
  ): Promise<void> {
    await this.join(gameId, clientId);
    await this.save(gameId, state);
  }
  async list(): Promise<string[]> {
    return this.publisher.keys("*");
  }
  async hasJoined(gameId: string, clientId: string): Promise<boolean> {
    const client = await this.publisher.scan(gameId, "MATCH", clientId);
    return !!client;
  }
  async getPlayers(gameId: string) {
    return await this.publisher.lrange(gameId, 0, -1);
  }
}
