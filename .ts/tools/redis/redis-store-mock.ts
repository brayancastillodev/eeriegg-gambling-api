import { RedisStoreName } from "./types";

export const RedisStoreMock = (name: RedisStoreName) => {
  return new Map<string, string>();
};
