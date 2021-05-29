import { getUser } from "../../db-controller/user";
import { WebsocketErrorMessage } from "../../helper/error/types";
import { WebsocketError } from "../../helper/error/websocket-error";
import { SocketPoolInstance } from "../../tools/socket-pool";
import { SocketChannel } from "../../tools/socket-pool/socket-channel";
import { SocketChannelName } from "../../tools/socket/types";
import { verifyToken } from "../../utils/auth";
import { IGeneralActionMap } from "./types";

export class GeneralService extends SocketChannel<SocketChannelName.GENERAL> {
  constructor() {
    super(SocketChannelName.GENERAL);
  }

  protected actions: {
    [A in keyof IGeneralActionMap]: (
      clientId: string,
      message: IGeneralActionMap[A]
    ) => Promise<void>;
  } = {
    authenticate: async (clientId: string, { token }: { token: string }) =>
      this.authenticate(clientId, token),
  };

  private async authenticate(clientId: string, token: string) {
    const client = SocketPoolInstance.getClient(clientId);
    try {
      const { id: userId } = await verifyToken(token);
      const user = await getUser(userId);
      if (!user) throw new Error();
      client.setAuthUser(user);
      client.send({
        channel: this.name,
        event: { type: "authentication", data: { success: true } },
      });
    } catch (err) {
      throw new WebsocketError(WebsocketErrorMessage.UNAUTHORIZED);
    }
  }
}
