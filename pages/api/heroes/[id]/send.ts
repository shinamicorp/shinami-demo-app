import {
  withMethodHandlers,
  withVerifiedEmailRequired,
} from "@/lib/api/handler";
import { getUserWallet } from "@/lib/api/shinami";
import { ApiErrorBody } from "@/lib/shared/error";
import { SendTarget, WithOwner, WithTxDigest, sui } from "@/lib/shared/sui";
import { NextApiHandler } from "next";
import { buildGaslessTransactionBytes } from "shinami";
import { validate } from "superstruct";

const handler: NextApiHandler<
  (WithOwner & WithTxDigest) | ApiErrorBody
> = async (req, res) => {
  const { id } = req.query;
  const [_, body] = validate(req.body, SendTarget);
  if (!body) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const userWallet = (await getUserWallet(req, res))!;
  const txBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.transferObjects([txb.object(id as string)], txb.pure(body.recipient));
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

export default withVerifiedEmailRequired(withMethodHandlers({ post: handler }));
