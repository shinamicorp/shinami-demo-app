import {
  withMethodHandlers,
  withVerifiedEmailRequired,
} from "@/lib/api/handler";
import { getUserWallet } from "@/lib/api/shinami";
import { ApiErrorBody } from "@/lib/shared/error";
import { Hero, LevelUpRequest, PACKAGE_ID } from "@/lib/shared/hero";
import {
  WithOwner,
  WithTxDigest,
  parseObjectWithOwner,
  sui,
} from "@/lib/shared/sui";
import { NextApiHandler } from "next";
import { buildGaslessTransactionBytes } from "shinami";
import { validate } from "superstruct";

const handler: NextApiHandler<
  (Hero & WithOwner & WithTxDigest) | ApiErrorBody
> = async (req, res) => {
  const { id } = req.query;
  const [_, body] = validate(req.body, LevelUpRequest);
  if (!body) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const userWallet = (await getUserWallet(req, res))!;
  const txBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${PACKAGE_ID}::hero::level_up_hero`,
        arguments: [
          txb.object(id as string),
          txb.object(body.ticketId),
          txb.pure(body.damage),
          txb.pure(body.speed),
          txb.pure(body.defense),
        ],
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

  const hero = parseObjectWithOwner(
    await sui.getObject({
      id: id as string,
      options: { showContent: true, showOwner: true },
    }),
    Hero
  );
  res.json({ ...hero, txDigest: txResp.digest });
};

export default withVerifiedEmailRequired(withMethodHandlers({ post: handler }));
