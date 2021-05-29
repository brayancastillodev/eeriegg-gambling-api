import { IS_PRODUCTION } from "../../global/env";
import { PubSub as PubSubProduction } from "./pubsub";
import { PubSubMock as PubSubTest } from "./pubsub-mock";
import { RedisStore as RedisStoreProduction } from "./redis-store";
import { RedisStoreMock as RedisStoreTest } from "./redis-store-mock";

export const PubSub = IS_PRODUCTION ? PubSubProduction : PubSubTest;
export const RedisStore = IS_PRODUCTION ? RedisStoreProduction : RedisStoreTest;
