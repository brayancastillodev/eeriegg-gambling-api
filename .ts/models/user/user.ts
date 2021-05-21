import { IRoleModel } from '../role/role';

/**
 * Model definition for user
 */
export interface IUserModel {
  id: string;
  username: string;
  email: string;
  provider?: string;
  password?: string;
  resetPasswordToken?: string;
  confirmationToken?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: IRoleModel;
  _id: string;
  createdAt: Date;
}
