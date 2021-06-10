import Redis from "ioredis";
import {
  REDIS_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  IS_DEVELOPMENT,
} from "../../../global/env";

const connections: Map<string, Redis.Redis> = new Map();

const options: Redis.RedisOptions = {
  port: REDIS_PORT,
  host: REDIS_HOST,
  db: 0,
};
if (!IS_DEVELOPMENT) {
  options.password = REDIS_PASSWORD;
  options.tls = { rejectUnauthorized: false };
}


const dbPools: Map<string, number> = new Map([
  ['main:pub:coin_flip', 2],
]);

export const getRedisClient = (name: string) => {
  const client = connections.get(name);
  // TODO: The function always creates a db with index 0 and when calling flushdb deletes all data for each connection.
  //  Changes: create separate db 0,1,2... for different connection
  //  temporary comment flushdb and use del
  if (client) {
    client.del(name)
    // client.flushdb();
    return client;
  }
  const db = dbPools.get(name);
  const _client = new Redis(db ? { ...options, db } : options);
  connections.set(name, _client);
  _client.del(name)
  // _client.flushdb();
  return _client;
};

export const connectRedisClient = (name: string) => {
  let client = connections.get(name);
  if (client) {
    return client;
  }
  const db = dbPools.get(name);
  client = new Redis(db ? { ...options, db } : options);
  connections.set(name, client);
  return client;
};

export const subscriber = getRedisClient(`main:sub`);
