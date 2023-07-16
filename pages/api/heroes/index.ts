import { ApiErrorBody } from "@/lib/error";
import { Hero, MintHero, PACKAGE_ID } from "@/lib/hero";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextApiHandler } from "next";
import {
  ShinamiWalletSigner,
  buildGaslessTransactionBytes,
  createSuiProvider,
} from "shinami";
import { validate } from "superstruct";
import { SUPER_ACCESS_KEY, WALLET_SECRET, key, wal } from "../wallet";

export const sui = createSuiProvider(
  SUPER_ACCESS_KEY,
  process.env.NEXT_PUBLIC_NODE_RPC_URL_OVERRIDE,
  process.env.NEXT_PUBLIC_NODE_WSS_URL_OVERRIDE
);

const handler: NextApiHandler<Hero | ApiErrorBody> = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Bad method",
    });
  }

  const { user } = (await getSession(req, res))!;
  if (!user.email_verified) {
    return res.status(401).json({ error: "Email not verified" });
  }

  const [error, body] = validate(req.body, MintHero);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  const { name, imageUrl } = body;

  try {
    const signer = new ShinamiWalletSigner(user.email, WALLET_SECRET, key, wal);
    const txBytes = await buildGaslessTransactionBytes({
      sui,
      build: async (txb) => {
        const [hero] = txb.moveCall({
          target: `${PACKAGE_ID}::my_hero::mint`,
          arguments: [txb.pure(name), txb.pure(imageUrl)],
        });
        txb.transferObjects([hero], txb.pure(await signer.getAddress()));
      },
    });

    const txResp = await signer.executeGaslessTransactionBlock(
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

    res.json({
      objectId: ref.objectId,
      version: ref.version.toString(),
      name,
      imageUrl,
    });
  } catch (e) {
    console.error("Unhandled error", e);
    res.status(500).json({ error: "Internal error" });
  }
};

export default withApiAuthRequired(handler);
