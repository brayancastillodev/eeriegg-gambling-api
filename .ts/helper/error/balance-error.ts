import { BalanceErrorMessage } from "./types";

export class BalanceError extends Error {
  public readonly code = 10001;
  constructor(public readonly message: BalanceErrorMessage) {
    super(message);
    Object.setPrototypeOf(this, BalanceError.prototype);
  }
}
