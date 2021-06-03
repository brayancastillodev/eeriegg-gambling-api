import { saveWallet, updateHookId } from "../../db-controllers/wallet";
import { WalletErrorMessage } from "../../helper/error/types";
import { WalletError } from "../../helper/error/wallet-error";
import { createBtcWallet } from "../blockchain/bitcoin/bitcoin";
import {
  assignWalletToUser,
  createTransactionWebhook,
} from "../blockchain/bitcoin/block-cypher";

export class WalletService {
  async getUserBtcWallet(userId: string) {
    const doc = await strapi.query("wallet").findOne({ user: userId });
    if (doc) {
      return doc
    }
    const wallet = await createBtcWallet();
    const res = await assignWalletToUser(userId.toString(), wallet.address);
    if (res.userId !== userId) {
      throw new WalletError(WalletErrorMessage.CREATION_ERROR);
    }
    const hookId = await createTransactionWebhook(wallet.address);
    return await saveWallet({
      userId,
      hookId,
      ...wallet,
    });
  }
}
