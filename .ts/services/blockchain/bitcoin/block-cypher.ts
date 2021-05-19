import axios from "axios";
import {
  BLOCK_CYPHER_CHAIN,
  BLOCK_CYPHER_TOKEN,
  IS_DEVELOPMENT,
  NGROK_URL,
  PUBLIC_URL,
} from "../../../global/env";

const API_VERSION = "v1";
const BASE_URL = `https://api.blockcypher.com/${API_VERSION}/btc/${BLOCK_CYPHER_CHAIN}/`;
const CALLBACK_URL = IS_DEVELOPMENT
  ? `${NGROK_URL}/callback/bc/tx`
  : `${PUBLIC_URL}/callback/bc/tx`;

export const createTransactionWebhook = async (address: string) => {
  const req = axios.create({
    baseURL: BASE_URL,
    params: { token: BLOCK_CYPHER_TOKEN },
    data: {
      event: "unconfirmed-tx",
      address: address,
      url: CALLBACK_URL,
    },
  });
  const res: any = await req.post("/hooks");
  if (!res.id) {
    console.error("block-cypher", "createTransactionWebhook", "error");
  }
};

export const assignWalletToUser = async (userId: string, address: string) => {
  const req = axios.create({
    baseURL: BASE_URL,
    params: { token: BLOCK_CYPHER_TOKEN },
    data: {
      name: userId,
      addresses: [address],
    },
  });
  const res: any = await req.post("/wallets");
  return { userId: res.name, address: address };
};
