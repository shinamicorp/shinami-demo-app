import { ApiErrorBody, throwExpression } from "@/lib/error";
import { Wallet } from "@/lib/wallet";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextApiHandler } from "next";
import { KeyClient, ShinamiWalletSigner, WalletClient } from "shinami";

export const SUPER_ACCESS_KEY =
  process.env.SUPER_ACCESS_KEY ??
  throwExpression(new Error("SUPER_ACCESS_KEY not configured"));

export const WALLET_SECRET =
  process.env.WALLET_SECRET ??
  throwExpression(new Error("WALLET_SECRET not configured"));

export const key = new KeyClient(
  SUPER_ACCESS_KEY,
  process.env.KEY_RPC_URL_OVERRIDE
);
export const wal = new WalletClient(
  SUPER_ACCESS_KEY,
  process.env.WALLET_RPC_URL_OVERRIDE
);

const handler: NextApiHandler<Wallet | ApiErrorBody> = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Bad method",
    });
  }

  const { user } = (await getSession(req, res))!;
  if (!user.email_verified) {
    return res.status(401).json({ error: "Email not verified" });
  }

  try {
    const signer = new ShinamiWalletSigner(user.email, WALLET_SECRET, key, wal);
    res.json({ address: await signer.getAddress(true) });
  } catch (e) {
    console.error("Unhandled error", e);
    res.status(500).json({ error: "Internal error" });
  }
};

export default withApiAuthRequired(handler);
