import { saveWallet, updateHookId } from "../../db-controller/wallet";
import { WalletErrorMessage } from "../../helper/error/types";
import { WalletError } from "../../helper/error/wallet-error";
import { createBtcWallet } from "../blockchain/bitcoin/bitcoin";
import {
  assignWalletToUser,
  createTransactionWebhook,
} from "../blockchain/bitcoin/block-cypher";

export class WalletService {
  async createWallet(userId: string) {
    const doc = await strapi.query("wallet").findOne({ user: userId });
    if (doc) {
      throw new WalletError(WalletErrorMessage.ALREADY_CREATED);
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
