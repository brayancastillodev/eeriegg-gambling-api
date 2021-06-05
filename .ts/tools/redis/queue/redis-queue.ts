import * as uuid from "uuid";
import { RedisStore } from "../store/redis-store";
import { RedisStoreName } from "../types";
import { SocketChannelName } from "../../socket";
import { IQueueJob } from "./types";

const store = new RedisStore<any>(RedisStoreName.QUEUES);

export class RedisQueue<P> {
  public readonly name!: string;
  private running = false;
  constructor(
    name: SocketChannelName,
    taskName: string,
    private task: (params: P) => Promise<void>
  ) {
    this.name = `${name}:${taskName}`;
  }

  async add(params: P, userId: string): Promise<IQueueJob<P>> {
    const job: IQueueJob<P> = {
      created: new Date(),
      id: uuid.v4(),
      params,
      userId,
      name: this.name,
    };
    await store.client.rpush(this.name, JSON.stringify(job));
    this.run();
    return job;
  }

  private async run(): Promise<void> {
    if (this.running) return;
    this.running = true;
    const res = await store.client.lpop(this.name);
    if (!res) {
      this.running = false;
      return;
    }
    const job: IQueueJob<P> = JSON.parse(res);
    try {
      await this.task(job.params);
    } catch (err) {
      return this.handleError(job, err);
    }
    this.handleTaskFinished(job);
  }

  private handleTaskFinished(job: IQueueJob<P>) {
    this.running = false;
    console.log("Queue", "handleTaskFinished", "done", job.id);
    this.run();
  }

  private handleError(job: IQueueJob<P>, err: any) {
    this.running = false;
    console.log(
      "Queue",
      "handleError",
      "error in job",
      job.id,
      job.params,
      err
    );
  }
}
