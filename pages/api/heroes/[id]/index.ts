import {
  withMethodHandlers,
  withVerifiedEmailRequired,
} from "@/lib/api/handler";
import { getUserWallet } from "@/lib/api/shinami";
import { ApiErrorBody } from "@/lib/shared/error";
import { PACKAGE_ID } from "@/lib/shared/hero";
import { WithOwner, WithTxDigest, sui } from "@/lib/shared/sui";
import { NextApiHandler } from "next";
import { buildGaslessTransactionBytes } from "shinami";

const handler: NextApiHandler<
  (WithOwner & WithTxDigest) | ApiErrorBody
> = async (req, res) => {
  const { id } = req.query;
  const userWallet = (await getUserWallet(req, res))!;
  const txBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${PACKAGE_ID}::hero::burn_hero`,
        arguments: [txb.object(id as string)],
      });
    },
  });

  const txResp = await userWallet.executeGaslessTransactionBlock(
    txBytes,
    5_000_000,
    { showEffects: true }
  );

  if (txResp.effects?.status.status !== "success") {
    console.error("Tx execution failed", txResp);
    return res.status(500).json({
      error: `Tx execution failed: ${txResp.effects?.status.error}`,
    });
  }
  res.json({
    owner: { AddressOwner: await userWallet.getAddress() },
    txDigest: txResp.digest,
  });
};

export default withVerifiedEmailRequired(withMethodHandlers({ del: handler }));
