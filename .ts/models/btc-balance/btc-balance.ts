import { IUserModel } from '../user/user';

/**
 * Model definition for BTCBalance
 */
export interface IBTCBalanceModel {
  id: string;
  available?: number;
  locked?: number;
  user: IUserModel;
  _id: string;
  createdAt: Date;
}
