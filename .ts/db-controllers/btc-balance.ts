import { BalanceError } from "../helper/error/balance-error";
import { BalanceErrorMessage } from "../helper/error/types";
import { IBTCBalanceModel } from "../models";
import { IBTCBalanceUpdate } from "./types";

export const updateBtcBalance = async (
  update: IBTCBalanceUpdate
): Promise<IBTCBalanceModel> => {
  try {
    return strapi
      .query("btc-balance")
      .model.findOneAndUpdate(
        {
          user: update.userId,
        },
        {
          $inc: {
            available: (update.in || 0) - (update.out || 0),
            locked: (update.lock || 0) - (update.unlock || 0),
          },
        },
        {
          new: true,
          upsert: true,
        }
      )
      .lean()
      .exec();
  } catch (error) {
    console.warn("UpdateQueue", "do", "error", update.userId, error);
    throw new BalanceError(BalanceErrorMessage.UPDATE_FAILED);
  }
};
