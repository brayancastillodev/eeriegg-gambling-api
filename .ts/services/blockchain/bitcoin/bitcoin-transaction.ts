import { saveTransaction } from "../../../db-controllers/btc-transaction";
import { BTCTransactionType } from "../../../models";
import { IBtcTransaction } from "./types";

export const onIncomingBtcTransaction = async (
  address: string,
  transaction: IBtcTransaction
) => {
  const { from, amount, transactionHash } = transaction;
  try {
    await saveTransaction({
      transactionHash,
      amount,
      type:
        from === address
          ? BTCTransactionType.Withdraw
          : BTCTransactionType.Deposit,
      walletId: address,
    });
  } catch (error) {
    console.warn("BitcoinTransactionService", "onTransaction", "error", error);
  }
};
