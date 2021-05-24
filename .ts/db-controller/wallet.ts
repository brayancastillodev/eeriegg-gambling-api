import { IWalletModel } from "../models";

export const saveWallet = async (doc: {
  userId: string;
  address: string;
  publicKey: string;
  privateKey: string;
  hookId: string;
}): Promise<IWalletModel> => {
  const { address, privateKey, publicKey, userId, hookId } = doc;
  const wallet = await strapi.query("wallet").create({
    public_key: publicKey,
    private_key: privateKey,
    address,
    user: userId,
    bc_hook_id: hookId,
  });
  return wallet;
};

export const updateHookId = async (
  walletId: string,
  hookId: string
): Promise<boolean> => {
  const res = await strapi
    .query("wallet")
    .model.updateOne({ _id: walletId }, { bc_hook_id: hookId });

  return !!res?.nModified;
};
