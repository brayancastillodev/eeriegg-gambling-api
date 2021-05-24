import * as bitcoin from "bitcoinjs-lib";
import { IS_PRODUCTION } from "../../../global/env";
import { WalletErrorMessage } from "../../../helper/error/types";
import { WalletError } from "../../../helper/error/wallet-error";

const CHAIN = IS_PRODUCTION
  ? bitcoin.networks.bitcoin
  : bitcoin.networks.testnet;

export const createBtcWallet = async () => {
  const keyPair = bitcoin.ECPair.makeRandom({ network: CHAIN });
  const { address } = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network: CHAIN,
  });
  if (!address || !keyPair.privateKey) {
    console.warn("bitcoin", "createWallet", "error", "illegal key pair");
    throw new WalletError(WalletErrorMessage.CREATION_ERROR);
  }
  return {
    address,
    privateKey: keyPair.privateKey.toString("hex"),
    publicKey: keyPair.publicKey.toString("hex"),
  };
};
