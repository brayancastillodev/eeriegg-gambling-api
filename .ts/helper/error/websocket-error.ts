import { WebsocketErrorMessage } from "./types";

export class WebsocketError extends Error {
  public readonly code = 10001;
  constructor(public readonly message: WebsocketErrorMessage) {
    super(message);
  }
}
