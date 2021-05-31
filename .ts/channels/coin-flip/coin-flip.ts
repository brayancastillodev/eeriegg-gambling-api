import uuid from "uuid";
import { Game } from "../../tools/game/game";
import { SocketChannel } from "../../tools/socket/channel/socket-channel";
import { SocketChannelName } from "../../tools/socket";
import { ICoinFlipActionMap } from "./types";
import { RedisStore } from "../../tools/redis/redis-store";
import { RedisStoreName } from "../../tools/redis/types";

export class CoinFlipService extends SocketChannel<SocketChannelName.COIN_FLIP> {
  private games = new Map<string, Game>();
  private gameStore = RedisStore(RedisStoreName.GAMES);

  constructor() {
    super(SocketChannelName.COIN_FLIP);
  }

  protected actions: {
    [A in keyof ICoinFlipActionMap]: (
      clientId: string,
      message: ICoinFlipActionMap[A]
    ) => Promise<void>;
  } = {
    create: async (clientId, message) => this.create(clientId, message),
    confirm: async (clientId) => {},
    join: async (clientId) => {},
    leave: async (clientId) => {},
    flip: async (clientId) => {},
  };

  protected onSubscribe: (clientId: string) => void = (clientId: string) => {};

  protected onUnsubscribe: (clientId: string) => void = (
    clientId: string
  ) => {};

  private async create(clientId: string, message: undefined) {
    const game = new Game(uuid.v4());
    this.gameStore.set(game.id, clientId);
    this.games.set(game.id, game);
    await game.join(clientId);
    this.publish("created", {
      gameId: game.id,
      time: new Date(),
    });
    game.subscribe((event)=> {

    })
  }

  private async join(gameId: string) {
    const game = await this.gameStore.get(gameId)
    game
  }
}
