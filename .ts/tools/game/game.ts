import { PubSub } from "../redis";

export class Game extends PubSub {
  constructor(public readonly id: string) {
    super(id);
    this.subscribe();
  }
}
