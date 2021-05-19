export interface IBtcTransaction {
  transactionHash: string;
  amount: number;
  date: Date;
  blockNumber: number;
  from: string;
  to: string;
}
