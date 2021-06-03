import { getUser } from "../../db-controllers/user";
import { WebsocketErrorMessage } from "../../helper/error/types";
import { WebsocketError } from "../../helper/error/websocket-error";
import { SocketChannelName, SocketChannel } from "../../tools/socket";
import { verifyToken } from "../../helper/utils/auth";
import { IGeneralActionMap } from "./types";
import { SocketPoolInstance } from "../../tools/socket/pool";
export class GeneralChannel extends SocketChannel<SocketChannelName.GENERAL> {
  public readonly auth = false;

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
