import { WebsocketErrorMessage } from "../../helper/error/types";
import { WebsocketError } from "../../helper/error/websocket-error";
import { SocketPoolInstance } from "../../tools/socket-pool";
import { SocketChannel } from "../../tools/socket-pool/socket-channel";
import { SocketChannelName } from "../../tools/socket/types";
import { IGeneralActionMap } from "./types";

export class GeneralService extends SocketChannel<SocketChannelName.GENERAL> {
  constructor() {
    super(SocketChannelName.GENERAL);
  }

  protected actions: {
    [A in keyof IGeneralActionMap]: (
      clientId: string,
      message: IGeneralActionMap[A]
    ) => void;
  } = {
    authenticate: (clientId: string, { token }: { token: string }) => {
      this.authenticate(clientId, token);
    },
  };

  private async authenticate(clientId: string, token: string) {
    const client = SocketPoolInstance.getClient(clientId);
    try {
      const { id: userId } = await strapi.plugins[
        "users-permissions"
      ].services.jwt.verify(token);
      const user = await strapi
        .query("users-permissions")
        .findOne({ id: userId });
      client.authenticateUser(user);
    } catch (err) {
      throw new WebsocketError(WebsocketErrorMessage.UNAUTHORIZED);
    }
  }
}
