import Redis from "ioredis";
import { IS_PRODUCTION, NODE_ENV } from "../../global/env";

const connections: Map<string, Redis.Redis> = new Map();

export const getRedisClient = (name: string) => {
  if (IS_PRODUCTION) {
    const client = connections.get(name);
    if (client) {
      client.flushdb();
      return client;
    }
    const _client = new Redis({
      port: 6379, // Redis port
      host: "127.0.0.1", // Redis host
      family: 4, // 4 (IPv4) or 6 (IPv6)
      password: "auth",
      db: connections.size,
    });
    connections.set(name, _client);
    _client.flushdb();
    return _client;
  }
  console.warn(
    "getRedisClient",
    `redis should not be used in current env <${NODE_ENV}>`
  );
  return {} as Redis.Redis;
};
