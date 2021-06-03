export enum CronJobStatus {
  SCHEDULED = "scheduled",
  RUNNING = "running",
  FAILED = "failed",
  COMPLETE = "complete",
}

export interface ICronJob<Params> {
  id: string;
  params: Params;
  created: Date;
  executed?: Date;
  finished?: Date;
  failed?: Date;
  lastUpdate: Date;
  status: CronJobStatus;
}

export interface ICronJobUpdate {
  params?: any;
  failed?: Date;
  finished?: Date;
  executed?: Date;
  status?: CronJobStatus;
}
