import { IRoleModel } from '../role/role';

/**
 * Model definition for permission
 */
export interface IPermissionModel {
  id: string;
  type: string;
  controller: string;
  action: string;
  enabled: boolean;
  policy?: string;
  role?: IRoleModel;
  _id: string;
}
