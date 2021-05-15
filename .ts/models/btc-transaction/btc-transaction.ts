import { IWalletModel } from '../wallet/wallet';

/**
 * Model definition for BTCTransaction
 */
export interface IBTCTransactionModel {
  id: string;
  transactionHash: string;
  amount: number;
  wallet: IWalletModel;
  type: BTCTransactionType;
  _id: string;
}

export enum BTCTransactionType {
  Deposit = "Deposit",
  Withdraw = "Withdraw",
}
