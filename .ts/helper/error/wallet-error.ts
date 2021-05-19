import { WalletErrorMessage } from "./types";

export class WalletError extends Error {
  public readonly code = 10001;
  constructor(public readonly message: WalletErrorMessage) {
    super(message);
    Object.setPrototypeOf(this, WalletError.prototype);
  }
}
