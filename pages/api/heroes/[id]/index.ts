import {
  withMethodHandlers,
  withVerifiedEmailRequired,
} from "@/lib/api/handler";
import { getUserWallet } from "@/lib/api/shinami";
import { ApiErrorBody } from "@/lib/shared/error";
import { Hero, PACKAGE_ID, UpdateHeroRequest } from "@/lib/shared/hero";
import {
  WithOwner,
  WithTxDigest,
  parseObjectWithOwner,
  sui,
} from "@/lib/shared/sui";
import { NextApiHandler } from "next";
import { buildGaslessTransactionBytes } from "shinami";
import { validate } from "superstruct";

const burnHandler: NextApiHandler<
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

const updateHandler: NextApiHandler<
  (Hero & WithOwner & WithTxDigest) | ApiErrorBody
> = async (req, res) => {
  const { id } = req.query;
  const [error, body] = validate(req.body, UpdateHeroRequest);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const userWallet = (await getUserWallet(req, res))!;
  const txBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${PACKAGE_ID}::hero::rename_hero`,
        arguments: [txb.object(id as string), txb.pure(body.name)],
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

  // Workaround for routing inconsistency between this client and wallet service
  await sui.waitForTransactionBlock({
    digest: txResp.digest,
    timeout: 30_000,
    pollInterval: 1_000,
  });

  const hero = parseObjectWithOwner(
    await sui.getObject({
      id: id as string,
      options: { showContent: true, showOwner: true },
    }),
    Hero
  );

  res.json({ ...hero, txDigest: txResp.digest });
};

export default withVerifiedEmailRequired(
  withMethodHandlers({ del: burnHandler, patch: updateHandler })
);
