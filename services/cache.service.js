const expireCache = require('expire-cache');
const db = require('../database/connection');

const cacheService = {
  async setOneUser(userId) {
    let userCache = expireCache.namespace('userCache');
    const rolePermissions = await db('role AS r')
    .select('r.Rolename AS role', 'p.PermissionName AS permission')
    .join('user_role AS ur', 'r.RoleID', 'ur.RoleId')
    .leftJoin('role_permission AS rp', 'r.RoleID', 'rp.RoleId')
    .leftJoin('permission AS p', 'rp.permissionId', 'p.PermissionID')
    .where('ur.userId', userId);

    const roles = Array.from(new Set(rolePermissions.map((item) => item.role)));
    const permissions = Array.from(
      new Set(rolePermissions.filter((item) => item.permission != null).map((item) => item.permission))
    );
    console.log(roles)
    console.log(permissions)
    userCache(`${userId}`, { roles, permissions }, process.env.JWT_EXPIRE_TIME);
  },
  async getOneUser(userId) {
    const userCache = expireCache.namespace('userCache');
    if (!userCache) {
      return null;
    }

    return userCache(`${userId}`);
  },
  async getAllUser() {
    const userCache = expireCache.namespace('userCache');

    if (!userCache) {
      return null;
    }

    return userCache();
  },
};

Object.freeze(cacheService);

module.exports = 
  cacheService;
