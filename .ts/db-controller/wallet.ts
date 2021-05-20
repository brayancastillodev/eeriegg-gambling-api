import { IWalletModel } from "../models";

export const saveWallet = async (doc: {
  userId: string;
  address: string;
  publicKey: string;
  privateKey: string;
}): Promise<IWalletModel> => {
  const { address, privateKey, publicKey, userId } = doc;
  const wallet = await strapi.query("wallet").create({
    public_key: publicKey,
    private_key: privateKey,
    address,
    user: userId,
  });
  return wallet;
};
