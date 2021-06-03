import uuid from "uuid";
import { SocketChannel, SocketChannelName } from "../../tools/socket";
import {
  ICoinFlipActionMap,
  ICoinFlipGameState,
  ICoinFlipGameStateUpdate,
} from "./types";
import { GameManager } from "../../tools/game-manager/game-manager";
import { DateTools } from "../../tools/date/date";
import { GamblingTools } from "../../tools/gambling/gambling";
import { SocketPoolInstance } from "../../tools/socket/pool";
import { CronJobServiceInstance } from "../../services/cron";

export class CoinFlipChannel extends SocketChannel<SocketChannelName.COIN_FLIP> {
  private gameManager = new GameManager<
    SocketChannelName.COIN_FLIP,
    ICoinFlipGameState,
    ICoinFlipGameStateUpdate
  >(SocketChannelName.COIN_FLIP);

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
    start: async (clientId, message) => this.start(message.gameId, clientId),
  };

  protected onSubscribe: (clientId: string) => void = (clientId: string) => {};

  protected onUnsubscribe: (clientId: string) => void = (
    clientId: string
  ) => {};

  private async create(clientId: string) {
    const gameId = uuid.v4();
    await this.gameManager.create(gameId, clientId, {
      id: gameId,
    });
    this.publish("created", {
      gameId,
      time: new Date(),
    });
  }

  private async join(gameId: string, clientId: string) {
    await this.gameManager.join(gameId, clientId);
    this.gameManager.publish(gameId, "joined", {
      gameId,
      userId: clientId,
      time: new Date(),
    });
  }

  private async leave(gameId: string, clientId: string) {
    await this.gameManager.leave(gameId, clientId);
    this.gameManager.publish(gameId, "left", {
      gameId,
      userId: clientId,
      time: new Date(),
    });
  }

  private async start(gameId: string, clientId: string): Promise<void> {
    const game = await this.gameManager.get(gameId);
    if (!game) {
      throw new Error(`game not found ${gameId}`);
    }
    const client = SocketPoolInstance.getClient(clientId);
    await this.gameManager.update(gameId, { player1: client.user.id });
    const jobStart = DateTools.in(7);
    await CronJobServiceInstance.createJob(jobStart, gameId, this.task);
  }

  private task = async (gameId: string): Promise<void> => {
    const game = await this.gameManager.get(gameId);
    const players = await this.gameManager.getPlayers(gameId);
    if (!game) {
      throw new Error(`game not found ${gameId}`);
    }
    if (players.length !== 2) {
      throw new Error(`not enough players ${gameId}`);
    }
    if (!game.player1 || !game.player2) {
      throw new Error(`players not ready`);
    }
    const value = await GamblingTools.getRandomInteger();

    const winner = !!value ? players[0]! : players[1]!;
    await this.gameManager.update(gameId, { result: { winner, value } });
    this.gameManager.publish(gameId, "result", {
      gameId,
      time: new Date(),
      winner: { userId: winner },
    });
  };

  private async confirm(gameId: string, clientId: string): Promise<void> {
    const client = SocketPoolInstance.getClient(clientId);
    await this.gameManager.update(gameId, { player2: client.user.id });
  }
}
