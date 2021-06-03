import WebSocket from "ws";
import { WebsocketErrorMessage } from "../../../helper/error/types";
import { WebsocketError } from "../../../helper/error/websocket-error";
import { IUserModel } from "../../../models";
import {
  ISocketChannelEventMap,
  IWebsocketErrorMessage,
  OutgoingSocketMessage,
} from "../types";

/**
 * The `SocketClient` holds the clients socket connection. It is responsible to just communicate with the client.
 */
export class SocketClient {
  private _user: IUserModel | undefined;
  constructor(
    public readonly socket: WebSocket,
    public readonly id: string,
    private alive = true
  ) {}

  private registrationTime = Date.now();

  getRegistrationTime = () => {
    return this.registrationTime;
  };

  isAlive = (): boolean => {
    return this.alive;
  };

  /**
   * Every time we call this method we set `alive` to false and send a `ping`. Once we get a response
   * we can be sure the connection is still active.
   */
  checkIsAlive = (): void => {
    this.alive = false;
    this.socket.ping(() => (this.alive = true));
  };

  terminateConnection = () => {
    if (this.socket && this.socket.OPEN) {
      this.socket.close(1000, "no activity");
      this.alive = false;
    }
  };

  get user(): IUserModel {
    if (!this._user) {
      throw new WebsocketError(WebsocketErrorMessage.UNAUTHORIZED);
    }
    return this._user;
  }

  setAuthUser(user: IUserModel) {
    this._user = user;
  }
  /**
   * Messages to the client must a specific interface. If the connection state is not `OPEN` we do not
   * send any messages to the client connection.
   * @param response
   */
  send = <Channel extends keyof ISocketChannelEventMap>(
    response:
      | OutgoingSocketMessage<Channel, keyof ISocketChannelEventMap[Channel]>
      | IWebsocketErrorMessage
  ): void => {
    if (!this.socket.OPEN) return;
    try {
      this.socket.send(JSON.stringify(response));
    } catch (err) {
      console.warn("SocketClient", "send", "error", err);
    }
  };
}
