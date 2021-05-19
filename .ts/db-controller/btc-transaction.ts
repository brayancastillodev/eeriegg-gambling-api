import { BTCTransactionType } from "../models";

export const saveTransaction = async (transaction: {
  transactionHash: string;
  amount: number;
  type: BTCTransactionType;
  walletId: string;
}) => {
  const { transactionHash, amount, type, walletId } = transaction;
  const doc = await strapi.query("btc-transaction").create({
    transactionHash,
    amount,
    type,
    wallet: walletId,
  });
  return doc.toObject();
};
