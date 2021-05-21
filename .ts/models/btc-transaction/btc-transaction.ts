/**
 * Model definition for BTCTransaction
 */
export interface IBTCTransactionModel {
  id: string;
  transactionHash: string;
  amount: number;
  type: BTCTransactionType;
  userId: string;
  address: string;
  _id: string;
  createdAt: Date;
}

export enum BTCTransactionType {
  Deposit = "Deposit",
  Withdraw = "Withdraw",
}
