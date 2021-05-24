import axios from "axios";
import {
  BLOCK_CYPHER_CHAIN,
  BLOCK_CYPHER_TOKEN,
  IS_DEVELOPMENT,
  NGROK_URL,
  PUBLIC_URL,
} from "../../../global/env";
import { WalletErrorMessage } from "../../../helper/error/types";
import { WalletError } from "../../../helper/error/wallet-error";

const API_VERSION = "v1";
const BASE_URL = `https://api.blockcypher.com/${API_VERSION}/btc/${BLOCK_CYPHER_CHAIN}/`;
const CALLBACK_URL = IS_DEVELOPMENT
  ? `${NGROK_URL}/callback/bc/tx`
  : `${PUBLIC_URL}/callback/bc/tx`;

export const createTransactionWebhook = async (
  address: string
): Promise<string> => {
  const req = axios.create({
    baseURL: BASE_URL,
    params: { token: BLOCK_CYPHER_TOKEN },
  });
  try {
    const res: any = await req.post("/hooks", {
      event: "unconfirmed-tx",
      address: address,
      url: CALLBACK_URL,
    });
    const hookId = res.data.id;
    if (!hookId) {
      throw new WalletError(WalletErrorMessage.CREATION_ERROR_HOOK)
    }
    console.log("block-cypher", "createTransactionWebhook", "created", hookId);
    return hookId;
  } catch (error) {
    console.error(
      "block-cypher",
      "createTransactionWebhook",
      "error",
      error.response?.data?.error || error
    );
    throw new WalletError(WalletErrorMessage.CREATION_ERROR);
  }
};

export const assignWalletToUser = async (userId: string, address: string) => {
  const req = axios.create({
    baseURL: BASE_URL,
    params: { token: BLOCK_CYPHER_TOKEN },
  });

  try {
    const res: any = await req.post("/wallets", {
      name: userId,
      addresses: [address],
    });
    return { userId: res.data.name, address: address };
  } catch (error) {
    console.error(
      "block-cypher",
      "assignWalletToUser",
      "error",
      error.response?.data?.error || error
    );
    throw new WalletError(WalletErrorMessage.CREATION_ERROR);
  }
};
