import * as bitcoin from "bitcoinjs-lib";
import { saveWallet } from "../../../db-controller/wallet";
import { IS_PRODUCTION } from "../../../global/env";
import { WalletErrorMessage } from "../../../helper/error/types";
import { WalletError } from "../../../helper/error/wallet-error";
import { IWalletModel } from "../../../models";

const CHAIN = IS_PRODUCTION
  ? bitcoin.networks.bitcoin
  : bitcoin.networks.testnet;

export const createWallet = async (userId: string): Promise<IWalletModel> => {
  const keyPair = bitcoin.ECPair.makeRandom({ network: CHAIN });
  const { address } = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network: CHAIN,
  });
  if (!address || !keyPair.privateKey) {
    console.warn("bitcoin", "createWallet", "error", "illegal key pair");
    throw new WalletError(WalletErrorMessage.CREATION_ERROR);
  }
  try {
    return saveWallet({
      userId,
      address,
      privateKey: keyPair.privateKey.toString('hex'),
      publicKey: keyPair.publicKey.toString('hex'),
    });
  } catch (err) {
    console.warn("bitcoin", "createWallet", "error", err);
    throw new WalletError(WalletErrorMessage.CREATION_ERROR);
  }
};
