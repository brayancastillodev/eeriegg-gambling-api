# Contribute

This is a strapi application. Find the docs [here](https://strapi.io/documentation/developer-docs/latest/getting-started/introduction.html).

## Design

- API: `api/**/config`
- Controllers: `api/**/controllers`
- Models: `/api/**/models` \
  You can also build models by using the [Content-Type Manager](http://localhost:8081/admin/plugins/content-type-builder/content-types/)

## Typescript

The root of Typescript code is in `./ts`. Running `tsc` in project root transpiles `.ts` files to `/js`. \
Directory:

```
- app
  index.ts // entry point
- db-controllers // database queries and mutations
  - model1
- services // core services
  - services1
- tools
  - tool1
- channels // websocket channels
  - channel1
- models // auto generated types from `api/**/models`
- helper // helper functions
- global // global variables

```

### Channels & `PubSub`

Each channel represents a part of the application and has its own `PubSub`. Clients can subscribe to events and perform actions on them. \
A `PubSub` emits the event to all clients subscribed to the channel unless you pass a list of clientId as argument to the `emit` function: `pubSub.emit(event, [clientId])`. 

### `RedisStore`

Since we need to run multiple instances of a node application we need to have a center place for client connections. Also we want to have the state in one place.
Once an event is emitted in a channel all node instances subscribes to the redis db are notified to emit events to their connected clients.

![diagram](https://drive.google.com/file/d/1rDzHVTL8QOz5XGBxn8R0VSMrbVFsVoR_/view?usp=sharing)

1. Create channel:

```bash
mkdir .ts/channels/my_channel
touch .ts/channels/my_channel.ts
touch .ts/channels/types.ts
touch .ts/channels/index.ts
```

2. Define types

```
export interface MyChannelEventMap {
  my_event : {text: string}
}
export interface MyChannelActionMap {
  my_action : {text: string}
}
```

3. Define actions

```
import {SocketChannel} from "../tools/socket/channel/socket-channel";
export class MyChannel extends SocketChannel<MyChannelEventMap, MyChannelActionMap> {
  protected actions = ... // define actions here
  protected messageValidators = ... // define message validator here
}
```
