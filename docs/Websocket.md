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

- subscribe `data: undefined`
- unsubscribe `data: undefined`

## Channels

- chat
- general

### General

#### Actions

- authenticate `data: { token: string }`

#### Events

- authenticated `data: { success: boolean }`

### Chat

#### Actions

- send `data: { text: string }`

#### Events

- message `data: { user: { id: string; name: string }; text: string; time: Date}`
- joined `{ userId: string; time: Date }`
- left `{ userId: string; time: Date }`

## Example

```javascript
const socket = WebSocket("ws://eeriegg-test.herokuapp.com/");
const sendMessage = (channel, action, data) => {
  socket.send(
    JSON.stringify({
      channel,
      action,
      data,
    })
  );
};
socket.onOpen((ev) => {
  socket.onmessage((message) => {
    const { channel, event } = JSON.parse(message.data);
    if (channel === "general" && event.type === "authenticated") {
      // your socket connection has been authenticated
      sendMessage("chat", "subscribe");
    }

    if(channel === "chat") {
      // got chat events here
    }
  });
  sendMessage("general", "authenticate", { token: "TOKEN_HERE" });
});
```
