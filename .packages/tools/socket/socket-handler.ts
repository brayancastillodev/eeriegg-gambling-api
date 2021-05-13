import WebSocket from "ws";
import {
  SocketPoolInstance,
  SocketServiceInstance,
} from "../../singleton/socket";
import { SocketClient } from "./socket-client";

/**
 * The `SocketHandler` is responsible to handle all the incoming socket connections.
 * It stores all the connections in a `Map` with the id of the connected `User`
 */
export class SocketHandler {
  private clientGuard: NodeJS.Timeout | undefined;
  private wss: WebSocket.Server | undefined;
  constructor(strapi: any) {
    this.manageClientConnections();
    this.wss = new WebSocket.Server({ server: strapi.server });
    this.init();
  }

  private init() {
    this.wss?.on("connection", (socket, req) => {
      const id = req.headers["sec-websocket-key"] as string;
      const client = this.registerClient(socket, id);
      socket.on("message", (message) => {
        console.log("SocketHandler", "incoming message", message);
        if (typeof message !== "string") {
          console.warn("SocketHandler", "invalid message type");
          this.unregisterClient(client);
          return;
        }
        SocketServiceInstance.handleIncomingMessage(client, message);
      });
    });
  }

  /**
   * Anytime a client wants to connect to the socket a new `SocketClient` instance is created.
   * Before the client is registered the `protocol` header is verified to include a valid access token.
   */
  registerClient = (socket: WebSocket, id: string): SocketClient => {
    console.log(`SocketHandler`, "registerClient", id);
    const client = SocketPoolInstance.newClient(id, socket);
    this.listenClientEvents(client);
    return client;
  };

  private listenClientEvents = (client: SocketClient) => {
    client.socket.on("error", this.handleClientError);
    client.socket.on("close", (reason: any) => {
      console.log(`SocketHandler`, "listenClientEvents - closed", reason);
      this.unregisterClient(client);
    });
  };

  /**
   * Method to terminate clients connection and remove it from the connections `Map`
   */
  private unregisterClient = (client: SocketClient): void => {
    client.terminateConnection();
    if (SocketPoolInstance.getClient(client.id)) {
      console.log(`SocketHandler`, "unregisterClient", client.id);
      SocketPoolInstance.removeClient(client.id);
    }
  };

  /**
   * This method loops through all the connected sockets and check their availability.
   * Once there the connection was lost it is removed from the connections `Map`
   */
  private manageClientConnections = (): void => {
    this.clientGuard = setInterval(() => {
      if (!SocketPoolInstance.getAllClients()) return;
      for (const client of SocketPoolInstance.getAllClients()) {
        if (!client.isAlive()) return this.unregisterClient(client);
        client.checkIsAlive();
      }
    }, 1000 * 60);
  };

  public stopSocket = (): void => {
    if (!this.clientGuard) return;
    clearInterval(this.clientGuard);
    const clients = SocketPoolInstance.getAllClients();
    if (!clients) return;
    for (const client of clients) {
      this.unregisterClient(client);
    }
  };

  private handleClientError = (error: Error) => {
    console.warn(`SocketHandler`, "handleClientError", error.message);
  };
}
