import { IPermissionModel } from '../permission/permission';
import { IUserModel } from '../user/user';

/**
 * Model definition for role
 */
export interface IRoleModel {
  id: string;
  name: string;
  description?: string;
  type?: string;
  permissions: IPermissionModel[];
  users: IUserModel[];
  _id: string;
  createdAt: Date;
}
