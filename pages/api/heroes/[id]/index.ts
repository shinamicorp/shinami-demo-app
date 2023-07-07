import { ApiErrorBody } from "@/lib/error";
import { PACKAGE_ID } from "@/lib/hero";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextApiHandler } from "next";
import { ShinamiWalletSigner, buildGaslessTransactionBytes } from "shinami";
import { sui } from "..";
import { WALLET_SECRET, key, wal } from "../../wallet";

const handler: NextApiHandler<true | ApiErrorBody> = async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({
      error: "Bad method",
    });
  }

  const { user } = (await getSession(req, res))!;
  if (!user.email_verified) {
    return res.status(401).json({ error: "Email not verified" });
  }

  const { id } = req.query;

  try {
    const signer = new ShinamiWalletSigner(user.email, WALLET_SECRET, key, wal);
    const txBytes = await buildGaslessTransactionBytes({
      sui,
      build: async (txb) => {
        txb.moveCall({
          target: `${PACKAGE_ID}::my_hero::burn`,
          arguments: [txb.object(id as string)],
        });
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
    res.json(true);
  } catch (e) {
    console.error("Unhandled error", e);
    res.status(500).json({ error: "Internal error" });
  }
};

export default withApiAuthRequired(handler);
