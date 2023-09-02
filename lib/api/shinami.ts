import { getSession } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import {
  KeyClient,
  ShinamiWalletSigner,
  WalletClient,
  createSuiClient,
} from "shinami";
import { ApiErrorBody, throwExpression } from "../shared/error";

const SUPER_ACCESS_KEY =
  process.env.SUPER_ACCESS_KEY ??
  throwExpression(new Error("SUPER_ACCESS_KEY not configured"));

const PLAYER_WALLET_SECRET =
  process.env.PLAYER_WALLET_SECRET ??
  throwExpression(new Error("PLAYER_WALLET_SECRET not configured"));

const ADMIN_WALLET_SECRET =
  process.env.ADMIN_WALLET_SECRET ??
  throwExpression(new Error("ADMIN_WALLET_SECRET not configured"));

export const key = new KeyClient(
  SUPER_ACCESS_KEY,
  process.env.KEY_RPC_URL_OVERRIDE
);

export const wal = new WalletClient(
  SUPER_ACCESS_KEY,
  process.env.WALLET_RPC_URL_OVERRIDE
);

// A separate sui client for backend only, using the super key.
// This is so we can enable different access controls on the node key and the super key.
export const sui = createSuiClient(
  SUPER_ACCESS_KEY,
  process.env.NEXT_PUBLIC_NODE_RPC_URL_OVERRIDE,
  process.env.NEXT_PUBLIC_NODE_WS_URL_OVERRIDE
);

export const adminWallet = new ShinamiWalletSigner(
  "demo:admin", // admin wallet id
  ADMIN_WALLET_SECRET,
  key,
  wal
);

export async function getUserWallet(
  req: NextApiRequest,
  res: NextApiResponse<ApiErrorBody>
): Promise<ShinamiWalletSigner | null> {
  const session = await getSession(req, res);
  if (!session) return null;

  const { user } = session;
  if (!user.email_verified) return null;

  return new ShinamiWalletSigner(
    `demo:user:${user.email}`, // user wallet id
    PLAYER_WALLET_SECRET,
    key,
    wal
  );
}
