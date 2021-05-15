import { IBTCBalanceUpdate } from "./types";

export class UpdateQueue {
  private queues: IBTCBalanceUpdate[] = [];
  private running = false;
  constructor(private userId: string) {}

  add(update: IBTCBalanceUpdate) {
    this.queues.push(update);
    this.do();
  }

  private async do(): Promise<void> {
    if (this.running) return;
    const update = this.queues.shift();
    if (!update) return;
    this.running = true;
    try {
      await strapi.query("btc-balance").model.updateOne(
        {
          _id: this.userId,
        },
        {
          $inc: {
            available: (update.in || 0) - (update.out || 0),
            locked: (update.lock || 0) - (update.unlock || 0),
          },
        }
      );
    } catch (error) {
      console.warn("UpdateQueue", "do", "error", this.userId, error);
    }
    this.running = false;
    this.do();
  }
}
