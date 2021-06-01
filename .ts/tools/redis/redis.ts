import Redis from "ioredis";
import { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD } from "../../global/env";

const connections: Map<string, Redis.Redis> = new Map();

export const getRedisClient = (name: string) => {
  const client = connections.get(name);
  if (client) {
    client.flushdb();
    return client;
  }
  const _client = new Redis({
    port: REDIS_PORT, // Redis port
    host: REDIS_HOST, // Redis host
    family: 4, // 4 (IPv4) or 6 (IPv6)
    db: 0,
    password: REDIS_PASSWORD,
    tls: {
      rejectUnauthorized: true,
    },
  });
  connections.set(name, _client);
  _client.flushdb();
  return _client;
};

export const subscriber = getRedisClient(`main:sub`);
