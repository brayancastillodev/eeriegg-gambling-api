import { RedisStore, IPubSubEvent } from "../redis";
import { connectRedisClient } from "../redis/client/redis";
import { ISocketChannelEventMap } from "../socket";
import {ICoinFlipGameState} from "../../channels/coin-flip/types";

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
    state: Omit<GameState, "lastUpdate">,
    expireTime?: number
  ): Promise<void> {
    const expire = expireTime ? ['ex', expireTime] : []
    await this.join(gameId, clientId);
    await this.save(gameId, state, expire);
  }
  async list(): Promise<string[]> {
    return this.publisher.keys("*");
  }
  async all(): Promise<ICoinFlipGameState[]> {
    const keys = await this.list();
    if (keys.length === 0) {
      return [];
    }
    const data = await this.publisher.mget(keys);
    return data.map(e => (e  && JSON.parse(e)));
  }
  async hasJoined(gameId: string, clientId: string): Promise<boolean> {
    const client = await this.publisher.scan(gameId, "MATCH", clientId);
    return !!client;
  }
  async getPlayers(gameId: string) {
    return await this.publisher.lrange(gameId, 0, -1);
  }
}
