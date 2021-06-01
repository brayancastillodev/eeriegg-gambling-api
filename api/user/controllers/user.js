const {
  getBtcTransactionsUser,
} = require("../../../js/db-controllers/btc-transaction");

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

  }
};
