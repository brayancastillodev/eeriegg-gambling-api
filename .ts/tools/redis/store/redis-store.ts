import { SocketChannelName } from "../../socket";
import { getRedisClient } from "../client/redis";
import { RedisStoreName } from "../types";

export class RedisStore<T extends { id: string; lastUpdate: Date }, U = any> {
  public readonly client!: ReturnType<typeof getRedisClient>;

  constructor(name: RedisStoreName | SocketChannelName) {
    this.client = getRedisClient(`store:${name}`);
  }

  public async save(id: string, job: Omit<T, "lastUpdate">): Promise<void> {
    await this.client.set(
      id,
      JSON.stringify({ ...job, lastUpdate: new Date() })
    );
  }

  public async get(id: string): Promise<T | undefined> {
    const job = await this.client.get(id);
    if (!job) {
      console.warn("CronJobService", "getJob", "not found", id);
      return;
    }
    return JSON.parse(job);
  }

  public async update(id: string, update: Omit<U, "lastUpdate">) {
    const job = await this.get(id);
    if (!job) {
      return;
    }
    await this.save(id, { ...job, ...update, lastUpdate: new Date() });
  }
}
