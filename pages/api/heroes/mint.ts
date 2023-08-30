import {
  withMethodHandlers,
  withVerifiedEmailRequired,
} from "@/lib/api/handler";
import { getUserWallet } from "@/lib/api/shinami";
import { ApiErrorBody } from "@/lib/shared/error";
import { Hero, MintHeroRequest, PACKAGE_ID } from "@/lib/shared/hero";
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
  const [error, body] = validate(req.body, MintHeroRequest);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const userWallet = (await getUserWallet(req, res))!;
  const txBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      const hero = txb.moveCall({
        target: `${PACKAGE_ID}::hero::mint_hero`,
        arguments: [
          txb.object(body.ticketId),
          txb.pure(body.name),
          txb.pure(body.damage),
          txb.pure(body.speed),
          txb.pure(body.defense),
        ],
      });
      txb.transferObjects([hero], txb.pure(await userWallet.getAddress(true)));
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

  const ref = txResp.effects?.created?.at(0)?.reference;
  if (!ref) {
    console.error("Object not created", txResp);
    return res.status(500).json({ error: "Object not created" });
  }

  // Workaround for routing inconsistency between this client and wallet service
  await sui.waitForTransactionBlock({
    digest: txResp.digest,
    timeout: 30_000,
    pollInterval: 1_000,
  });

  const hero = parseObjectWithOwner(
    await sui.getObject({
      id: ref.objectId,
      options: { showContent: true, showOwner: true },
    }),
    Hero
  );
  res.json({ ...hero, txDigest: txResp.digest });
};

export default withVerifiedEmailRequired(withMethodHandlers({ post: handler }));
