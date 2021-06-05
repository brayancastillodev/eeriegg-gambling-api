export interface IQueueJob<P> {
  id: string;
  userId: string;
  name: string;
  created: Date;
  params: P;
}
