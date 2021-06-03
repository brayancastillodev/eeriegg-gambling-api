const secToMillis = (sec: number): number => 1000 * sec;

export const DateTools = {
  secToMillis,
  in(sec: number): Date {
    return new Date(Date.now() + secToMillis(sec));
  },
};
