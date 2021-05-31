import { BTCTransactionType, IBTCTransactionModel } from "../models";

export const saveTransaction = async (transaction: {
  transactionHash: string;
  amount: number;
  type: BTCTransactionType;
  walletId: string;
}): Promise<IBTCTransactionModel> => {
  const { transactionHash, amount, type, walletId } = transaction;
  const doc = await strapi.query("btc-transaction").create({
    transactionHash,
    amount,
    type,
    wallet: walletId,
  });
  return doc;
};

export const getBtcTransactionsUser = (
  userId: string
): Promise<IBTCTransactionModel[]> => {
  return strapi.query("btc-transaction").find({ userId });
};
