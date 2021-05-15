import { IUserModel } from '../user/user';

/**
 * Model definition for Wallet
 */
export interface IWalletModel {
  id: string;
  public_key: string;
  private_key: string;
  user: IUserModel;
  _id: string;
}
