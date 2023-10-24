import {
  GasStationClient,
  KeyClient,
  ShinamiWalletSigner,
  WalletClient,
  createSuiClient,
} from "shinami";
import { throwExpression } from "../shared/utils";

const SUPER_ACCESS_KEY =
  process.env.SUPER_ACCESS_KEY ??
  throwExpression(new Error("SUPER_ACCESS_KEY not configured"));

const ADMIN_WALLET_SECRET =
  process.env.ADMIN_WALLET_SECRET ??
  throwExpression(new Error("ADMIN_WALLET_SECRET not configured"));

const ADMIN_WALLET_ID = process.env.ADMIN_WALLET_ID ?? "demo:admin";

export const key = new KeyClient(
  SUPER_ACCESS_KEY,
  process.env.KEY_RPC_URL_OVERRIDE
);

export const wal = new WalletClient(
  SUPER_ACCESS_KEY,
  process.env.WALLET_RPC_URL_OVERRIDE
);

export const gas = new GasStationClient(
  SUPER_ACCESS_KEY,
  process.env.GAS_RPC_URL_OVERRIDE
);

// A separate sui client for backend only, using the super key.
// This is so we can enable different access controls on the node key and the super key.
export const sui = createSuiClient(
  SUPER_ACCESS_KEY,
  process.env.NEXT_PUBLIC_NODE_RPC_URL_OVERRIDE,
  process.env.NEXT_PUBLIC_NODE_WS_URL_OVERRIDE
);

export const adminWallet = new ShinamiWalletSigner(
  ADMIN_WALLET_ID,
  wal,
  ADMIN_WALLET_SECRET,
  key
);
