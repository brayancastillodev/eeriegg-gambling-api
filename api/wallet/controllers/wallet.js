"use strict";
const bitcoin = require("../../../js/services/blockchain/bitcoin/bitcoin");
const blockCypher = require("../../../js/services/blockchain/bitcoin/block-cypher");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const { id } = ctx?.state?.user;

    if (!id) ctx.unauthorized("unauthorized");

    const wallet = await bitcoin.createWallet(ctx.state.user.id);
    try {
      await blockCypher.assignWalletToUser(wallet.user._id, wallet.address);
      await blockCypher.createTransactionWebhook(wallet.address);

      // NOTE: might need to flag the wallet so we can be sure we are listening from incoming transacti‚ons
    } catch (error) {
      console.log("controller", "wallet", error);

      // NOTE: we could not assign the created wallet to the user on block cypher
      // TODO: remove the wallet from the db and throw an error to the user
    }
  },
};
