# Websocket Documentation

## Introduction

url test: `ws://eeriegg-test.herokuapp.com/`

### `Message`

All messages send to the socket should have a structure like:

```javascript
{
  "channel": string,
  "action": string,
  "data": {
    // data here
  }
}
```

### `Event`

All incoming messages from the server look like:

```javascript
{
  "channel": string,
  "event": {
    "type": string,
    "data": {
      // data here
      }
  }
}
```

### Common actions

Are available in all channels to subscribe/unsubscribe to channel events

- subscribe `undefined`
- unsubscribe `undefined`

## Channels

- chat
- general
- coinflip

### General

#### Actions

- authenticate `{ token: string }`

#### Events

- authenticated `{ success: boolean }`

### Chat

#### Actions

- send `{ text: string }`

#### Events

- message `{ user: { id: string; name: string }; text: string; time: Date}`
- joined `{ userId: string; time: Date }`
- left `{ userId: string; time: Date }`

### Coinflip

#### Actions

- create
- join `{ gameId: string }`
- leave `{ gameId: string }`
- start `{ gameId: string }`
- confirm `{ gameId: string }`

#### Events

- created `{ gameId: string }`
- joined `{ gameId: string, userId: string }`
- left `{ gameId: string, userId: string }`
- result `{ gameId: string, winner: { userId: string, value: number} }`

## Example

```typescript
const socket = WebSocket("ws://eeriegg-test.herokuapp.com/");

socket.onOpen((ev) => {
  socket.onmessage((message) => {
    const { channel, event } = JSON.parse(message.data);
    if (channel === "general" && event.type === "authenticated") {
      // your socket connection has been authenticated
      sendMessage("chat", "subscribe");
    }

    if (channel === "chat") {
      // got chat events here
    }
  });
  sendMessage("general", "authenticate", { token: "TOKEN_HERE" });
});

interface EventData {
  type: string;
  data: any;
}

const Websocket = () => {
  const listers = {};
  const socket = WebSocket("ws://eeriegg-test.herokuapp.com/");
  socket.on("message", (message) => {
    const eventData = JSON.parse(message.data);
    emit(eventData.channel, eventData.event);
  });
  socket.on("connect", () => {
    sendMessage("general", "authenticate", { token: "TOKEN_HERE" });
  });
  const on = (channel, func: (event: EventData) => void) => {
    if (!listers[channel]) {
      listers[channel] = [];
    }
    listers[channel].push(func);
    return () => off(channel, func);
  };
  const off = (channel, func) => {
    listers[channel] = listers[channel]?.filter((_func) => _func !== func);
  };
  const emit = (channel, event: EventData) => {
    listers[channel].forEach((func) => {
      func(event);
    });
  };
  const send = (channel, action, data) => {
    socket.send(
      JSON.stringify({
        channel,
        action,
        data,
      })
    );
  };
  return {
    send,
    on,
    off,
  };
};

const socket = Websocket();
socket.send("chat", "subscribe");
socket.send("coinflip", "subscribe");
socket.send("coinflip", "create");
```
