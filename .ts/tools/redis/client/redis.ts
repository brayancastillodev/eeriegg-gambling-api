import Redis from "ioredis";
import {
  REDIS_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  IS_DEVELOPMENT,
} from "../../../global/env";

const connections: Map<string, Redis.Redis> = new Map();

const options: Redis.RedisOptions = {
  port: REDIS_PORT, // Redis port
  host: REDIS_HOST, // Redis host
  db: 0,
  password: REDIS_PASSWORD,
  tls: { rejectUnauthorized: false },
};
const options_dev: Redis.RedisOptions = {
  port: REDIS_PORT, // Redis port
  host: REDIS_HOST, // Redis host
  db: 0,
};

export const getRedisClient = (name: string) => {
  const client = connections.get(name);
  if (client) {
    client.flushdb();
    return client;
  }
  const _client = new Redis(IS_DEVELOPMENT ? options_dev : options);
  connections.set(name, _client);
  _client.flushdb();
  return _client;
};

export const connectRedisClient = (name: string) => {
  let client = connections.get(name);
  if (client) {
    return client;
  }
  client = new Redis(IS_DEVELOPMENT ? options_dev : options);
  connections.set(name, client);
  return client;
};

export const subscriber = getRedisClient(`main:sub`);
