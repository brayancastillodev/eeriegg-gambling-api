const {
  getBtcTransactionsUser,
} = require("../../../js/db-controllers/btc-transaction");
const { WalletServiceInstance } = require("../../../js/services/wallet");


module.exports = {
  async getBalanceHistory(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const btcTransactions = await getBtcTransactionsUser(user.id);
    return btcTransactions.map((tx) => {
      return {
        type: tx.type,
        amount: tx.amount,
        details: `TXID: ${tx.transactionHash}`,
        date: tx.createdAt,
      };
    });
  },
  async getBtcWallet(ctx) {
    const { id } = ctx?.state?.user;
    if (!id) ctx.unauthorized("unauthorized");
    try {
      const wallet = await WalletServiceInstance.getUserBtcWallet(
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
