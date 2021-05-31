import { WebsocketErrorMessage } from "../error/types";
import { WebsocketError } from "../error/websocket-error";
import { IncomingSocketMessage, SocketChannelName } from "../../tools/socket/types";

const parseJson = (data: any): any => {
  try {
    return JSON.parse(data);
    console.log('parse', data)
  } catch (err) {
    console.error("failed to parse JSON string", err);
    throw new WebsocketError(WebsocketErrorMessage.INVALID_MESSAGE);
  }
};

export const messageParser = (message: string): IncomingSocketMessage => {
  const json = parseJson(message);
  if (
    !json.channel ||
    typeof json.channel !== "string" ||
    !json.action ||
    typeof json.action !== "string"
  ) {
    throw new WebsocketError(WebsocketErrorMessage.INVALID_MESSAGE);
  }
  if (!Object.values(SocketChannelName).includes(json.channel)) {
    throw new WebsocketError(WebsocketErrorMessage.INVALID_CHANNEL);
  }

  return {
    channel: json.channel,
    action: json.action,
    data: json.data,
  };
};
