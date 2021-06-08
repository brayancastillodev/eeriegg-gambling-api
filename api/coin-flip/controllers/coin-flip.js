const game_manager_list = require("../../../js/tools/game-manager/game-manager");
const socket_list = require("../../../js/tools/socket");

module.exports = {
  async getRooms(ctx) {
    const gameManager = new game_manager_list.GameManager(socket_list.SocketChannelName.COIN_FLIP);
    return await gameManager.list();
  },
};
