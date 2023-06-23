import { ApiErrorBody } from "@/lib/error";
import { SendHero } from "@/lib/hero";
import { buildGaslessTransactionBytes } from "@/sdk/shinami/gas";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { TransactionBlock } from "@mysten/sui.js";
import { NextApiHandler } from "next";
import { validate } from "superstruct";
import { sui } from "..";
import { WALLET_SECRET, key, wallet } from "../../wallet";

const handler: NextApiHandler<true | ApiErrorBody> = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Bad method",
    });
  }

  const { user } = (await getSession(req, res))!;
  if (!user.email_verified) {
    return res.status(401).json({ error: "Email not verified" });
  }

  const { id } = req.query;
  const [_, body] = validate(req.body, SendHero);

  if (!body) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const me = await wallet.getWallet(user.email);

    const txb = new TransactionBlock();
    txb.transferObjects([txb.object(id as string)], txb.pure(body.recipient));

    const { txBytes, gasBudget } = await buildGaslessTransactionBytes(
      txb,
      sui,
      true,
      me
    );

    const session = await key.createSession(WALLET_SECRET);
    const txResp = await wallet.executeGaslessTransactionBlock(
      user.email,
      session,
      txBytes,
      gasBudget!,
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
