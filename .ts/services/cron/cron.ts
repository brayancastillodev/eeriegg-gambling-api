import uuid from "uuid";
import { CronJob } from "cron";
import { RedisStore, RedisStoreName } from "../../tools/redis";
import { CronJobStatus, ICronJob, ICronJobUpdate } from "./types";

export class CronJobService {
  private store = new RedisStore<ICronJob<any>, ICronJobUpdate>(
    RedisStoreName.JOBS
  );
  private jobs = new Map<string, CronJob>();

  public async createJob<T>(
    cronTime: string | Date | moment.Moment,
    params: T,
    task: (params: T) => Promise<void>
  ): Promise<string> {
    const id = uuid.v4();
    const now = new Date();
    await this.store.save(id, {
      created: now,
      id,
      params,
      status: CronJobStatus.SCHEDULED,
    });
    const cron = new CronJob(cronTime, async () => {
      try {
        await task(params);
        await this.onJobFinished(id);
      } catch (err) {
        await this.onJobFailed(id);
      }
      this.cleanUpJob(id);
    });
    this.jobs.set(id, cron);
    return id;
  }

  private async onJobFinished(jobId: string) {
    await this.store.update(jobId, {
      finished: new Date(),
      status: CronJobStatus.COMPLETE,
    });
  }

  private async onJobFailed(jobId: string) {
    await this.store.update(jobId, {
      failed: new Date(),
      status: CronJobStatus.FAILED,
    });
  }

  private async cleanUpJob(jobId: string) {
    this.jobs.delete(jobId);
  }
}
