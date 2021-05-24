"use strict";
const { WalletServiceInstance } = require("../../../js/services/wallet");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const { id } = ctx?.state?.user;
    if (!id) ctx.unauthorized("unauthorized");
    try {
      const wallet = await WalletServiceInstance.createWallet(
        ctx.state.user.id
      );
      return {
        wallet: {
          userId: ctx.state.user.id,
          address: wallet.address,
        },
      };
    } catch (error) {
      ctx.throw(error.message);
      console.log("controller", "wallet", error);
    }
  },
};
