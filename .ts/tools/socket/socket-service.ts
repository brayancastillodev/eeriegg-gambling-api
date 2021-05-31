import WebSocket from "ws";
import { SocketHandlerInstance } from "./handler";
import { SocketPoolInstance } from "./pool";
import { SocketClient } from "./socket-client";

/**
 * The `SocketHandler` is responsible to handle all the incoming socket connections.
 * It stores all the connections in a `Map` with the id of the connected `User`
 */
export class SocketService {
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
      this.registerClient(socket, id);
      socket.on("message", (message) => {
        try {
          console.log("SocketHandler", "incoming message", message);
          if (typeof message !== "string") {
            console.warn("SocketHandler", "invalid message type");
            this.unregisterClient(id);
            return;
          }
          SocketHandlerInstance.handleIncomingMessage(message, id);
        } catch (err) {
          this.handleClientError(err, id);
        }
      });
    });
  }

  /**
   * Anytime a client wants to connect to the socket a new `SocketClient` instance is created.
   * Before the client is registered the `protocol` header is verified to include a valid access token.
   */
  private registerClient = (socket: WebSocket, id: string): SocketClient => {
    console.log(`SocketHandler`, "registerClient", id);
    const client = SocketPoolInstance.newClient(id, socket);
    this.listenClientEvents(client);
    return client;
  };

  private listenClientEvents = (client: SocketClient) => {
    client.socket.on("error", this.handleClientError);
    client.socket.on("close", (reason: any) => {
      console.log(`SocketHandler`, "listenClientEvents - closed", reason);
      this.unregisterClient(client.id);
    });
  };

  /**
   * Method to terminate clients connection and remove it from the connections `Map`
   */
  private unregisterClient = (clientId: string): void => {
    console.log(`SocketHandler`, "unregisterClient", clientId);
    try {
      const client = SocketPoolInstance.getClient(clientId);
      client.terminateConnection();
      SocketPoolInstance.removeClient(client.id);
      SocketHandlerInstance.unsubscribeClientFromAllChannels(client.id);
    } catch (err) {
      console.info("SocketHandler", "unregisterClient", "client not found", clientId);
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
        if (!client.isAlive()) return this.unregisterClient(client.id);
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
      this.unregisterClient(client.id);
    }
  };

  private handleClientError = (error: Error, clientId: string) => {
    console.warn(
      `SocketHandler`,
      "handleClientError",
      clientId,
      error?.message || error
    );
  };
}
