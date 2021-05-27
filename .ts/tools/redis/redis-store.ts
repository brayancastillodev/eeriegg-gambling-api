import { getRedisClient } from "./redis";
import { RedisStoreName } from "./types";

export const RedisStore = (name: RedisStoreName) => {
  return getRedisClient(`store:${name}`);
};
