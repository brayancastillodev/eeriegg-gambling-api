import {
  BTCTransactionType,
  IBTCTransactionModel,
  IWalletModel,
} from "../../../models";
import { IBTCTransaction } from "./types";

export class BitcoinTransactionService {
  async onTransaction(
    wallet: IWalletModel["public_key"],
    transaction: IBTCTransaction
  ) {
    const { from, amount, transactionHash } = transaction;
    const transactionDoc: Omit<
      IBTCTransactionModel,
      "_id" | "id" | "wallet"
    > & {
      wallet: string;
    } = {
      transactionHash,
      amount,
      type:
        from === wallet
          ? BTCTransactionType.Withdraw
          : BTCTransactionType.Deposit,
      wallet,
    };
    try {
      await strapi.query("btc-transaction").create(transactionDoc);
    } catch (error) {
      console.warn(
        "BitcoinTransactionService",
        "onTransaction",
        "error",
        error
      );
    }
  }
}
