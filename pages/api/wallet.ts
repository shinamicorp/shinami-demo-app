import { ApiErrorBody } from "@/lib/error";
import { Wallet } from "@/lib/wallet";
import { KeyClient, WalletClient } from "@/sdk/shinami/wallet";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { JSONRPCError } from "@open-rpc/client-js";
import { NextApiHandler } from "next";

export const key = new KeyClient(
  process.env.SUPER_ACCESS_KEY!,
  process.env.KEY_RPC_URL_OVERRIDE
);
export const wallet = new WalletClient(
  process.env.SUPER_ACCESS_KEY!,
  process.env.WALLET_RPC_URL_OVERRIDE
);

async function getOrCreateWallet(id: string, secret: string): Promise<Wallet> {
  try {
    return {
      address: await wallet.getWallet(id),
    };
  } catch (e) {
    if (!(e instanceof JSONRPCError && e.code === -32602)) {
      throw e;
    }
  }

  console.info("Creating wallet", id);

  return {
    address: await wallet.createWallet(id, await key.createSession(secret)),
  };
}

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
    res.json(await getOrCreateWallet(user.email, process.env.WALLET_SECRET!));
  } catch (e) {
    console.error("Unhandled error", e);
    res.status(500).json({ error: "Internal error" });
  }
};

export default withApiAuthRequired(handler);
