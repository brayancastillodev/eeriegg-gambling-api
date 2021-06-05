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
import { RedisQueue } from "../../tools/redis/queue/redis-queue";

export interface ICoinFlipQueueParams {
  clientId: string;
  gameId: string;
}
export class CoinFlipChannel extends SocketChannel<SocketChannelName.COIN_FLIP> {
  private gameManager = new GameManager<
    SocketChannelName.COIN_FLIP,
    ICoinFlipGameState,
    ICoinFlipGameStateUpdate
  >(SocketChannelName.COIN_FLIP);
  private queue = new RedisQueue<ICoinFlipQueueParams>(
    this.name,
    "ready",
    (params: ICoinFlipQueueParams) => this.ready_queue_task(params)
  );
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
    join: async (clientId, message) => this.join(clientId, message.gameId),
    leave: async (clientId, message) => this.leave(clientId, message.gameId),
    ready: async (clientId, message) => this.ready(message.gameId, clientId),
  };

  protected onSubscribe: (clientId: string) => void = (clientId: string) => {};

  protected onUnsubscribe: (clientId: string) => void = (
    clientId: string
  ) => {};

  private async create(clientId: string) {
    const gameId = uuid.v4();
    await this.gameManager.create(gameId, clientId, {
      id: gameId,
      initiator: clientId,
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
    await this.gameManager.update(gameId, { opponent: clientId });
  }

  private async leave(gameId: string, clientId: string) {
    await this.gameManager.leave(gameId, clientId);
    const game = await this.gameManager.get(gameId);
    if (game?.initiator === clientId && !game?.opponent) {
      return this.gameManager.remove(gameId);
    }
    if (game?.initiator === clientId) {
      await this.gameManager.update(gameId, {
        opponent: undefined,
        initiator_ready: undefined,
        opponent_ready: undefined,
        initiator: game.opponent,
      });
    } else {
      await this.gameManager.update(gameId, { opponent: undefined });
    }
    this.gameManager.publish(gameId, "left", {
      gameId,
      userId: clientId,
      time: new Date(),
    });
  }

  private async ready(gameId: string, clientId: string): Promise<void> {
    const joinedGame = await this.gameManager.hasJoined(gameId, clientId);
    const game = await this.gameManager.get(gameId);
    const client = SocketPoolInstance.getClient(clientId);
    if (!joinedGame || !game) {
      throw new Error("unauthorized");
    }
    await this.queue.add({ clientId, gameId }, client.user.id);
  }

  private async ready_queue_task(params: ICoinFlipQueueParams): Promise<void> {
    const { clientId, gameId } = params;
    const game = await this.gameManager.get(gameId);
    if (!game) {
      console.error(
        "CoinFlipChannel",
        "ready_queue_task",
        "fatal game not found",
        gameId
      );
      return;
    }
    const player = game.initiator === clientId ? "initiator" : "opponent";
    await this.gameManager.update(gameId, { [player]: clientId });
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
      winner: { userId: winner, value },
    });
  };

  private async confirm(gameId: string, clientId: string): Promise<void> {
    const client = SocketPoolInstance.getClient(clientId);
    await this.gameManager.update(gameId, { player2: client.user.id });
  }
}
