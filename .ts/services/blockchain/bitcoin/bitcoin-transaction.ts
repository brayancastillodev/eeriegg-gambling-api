import { saveTransaction } from "../../../db-controller/btc-transaction";
import { BTCTransactionType, IWalletModel } from "../../../models";
import { IBtcTransaction } from "./types";

export const onIncomingBtcTransaction = async (
  wallet: IWalletModel["public_key"],
  transaction: IBtcTransaction
) => {
  const { from, amount, transactionHash } = transaction;
  try {
    await saveTransaction({
      transactionHash,
      amount,
      type:
        from === wallet
          ? BTCTransactionType.Withdraw
          : BTCTransactionType.Deposit,
      walletId: wallet,
    });
  } catch (error) {
    console.warn("BitcoinTransactionService", "onTransaction", "error", error);
  }
};
