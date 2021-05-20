"use strict";
const bitcoin = require("../../../js/services/blockchain/bitcoin/bitcoin");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const { id } = ctx?.state?.user;

    if (!id) ctx.unauthorized("unauthorized");

    return bitcoin.createWallet(ctx.state.user.id);
  },
};
