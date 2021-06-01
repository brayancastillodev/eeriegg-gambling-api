import { SocketChannel } from "../../tools/socket/channel/socket-channel";
import { SocketChannelName } from "../../tools/socket";
import { ICoinFlipActionMap } from "./types";
import { GameManager } from "../../tools/game/game";

export class CoinFlipService extends SocketChannel<SocketChannelName.COIN_FLIP> {
  private gameStore = new GameManager(SocketChannelName.COIN_FLIP);

  constructor() {
    super(SocketChannelName.COIN_FLIP);
  }

  protected actions: {
    [A in keyof ICoinFlipActionMap]: (
      clientId: string,
      message: ICoinFlipActionMap[A]
    ) => Promise<void>;
  } = {
    create: async (clientId) => this.create(clientId),
    confirm: async (clientId) => {},
    join: async (clientId, message) => this.join(clientId, message.gameId),
    leave: async (clientId, message) => this.leave(clientId, message.gameId),
    flip: async (clientId) => {},
  };

  protected onSubscribe: (clientId: string) => void = (clientId: string) => {};

  protected onUnsubscribe: (clientId: string) => void = (
    clientId: string
  ) => {};

  private async create(clientId: string) {
    const gameId = await this.gameStore.create(clientId);
    this.gameStore.publish(gameId, "created", {
      gameId,
      time: new Date(),
    });
  }

  private async join(gameId: string, clientId: string) {
    await this.gameStore.join(gameId, clientId);
    this.gameStore.publish(gameId, "joined", {
      gameId,
      userId: clientId,
      time: new Date(),
    });
  }

  private async leave(gameId: string, clientId: string) {
    await this.gameStore.leave(gameId, clientId);
    this.gameStore.publish(gameId, "left", {
      gameId,
      userId: clientId,
      time: new Date(),
    });
  }
}
