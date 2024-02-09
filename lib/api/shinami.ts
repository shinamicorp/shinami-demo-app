/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GasStationClient,
  KeyClient,
  ShinamiWalletSigner,
  WalletClient,
  ZkProverClient,
  ZkWalletClient,
  createSuiClient,
} from "@shinami/clients";
import { throwExpression } from "../shared/utils";

const SHINAMI_SUPER_ACCESS_KEY =
  process.env.SHINAMI_SUPER_ACCESS_KEY ??
  throwExpression(new Error("SUPER_ACCESS_KEY not configured"));

const ADMIN_WALLET_SECRET =
  process.env.ADMIN_WALLET_SECRET ??
  throwExpression(new Error("ADMIN_WALLET_SECRET not configured"));

const ADMIN_WALLET_ID = process.env.ADMIN_WALLET_ID ?? "demo:admin";

export const key = new KeyClient(
  SHINAMI_SUPER_ACCESS_KEY,
  process.env.KEY_RPC_URL_OVERRIDE
);

export const wal = new WalletClient(
  SHINAMI_SUPER_ACCESS_KEY,
  process.env.WALLET_RPC_URL_OVERRIDE
);

export const gas = new GasStationClient(
  SHINAMI_SUPER_ACCESS_KEY,
  process.env.GAS_RPC_URL_OVERRIDE
);

// A separate sui client for backend only, using the super key.
// This is so we can enable different access controls on the node key and the super key.
export const sui = createSuiClient(
  SHINAMI_SUPER_ACCESS_KEY,
  process.env.NEXT_PUBLIC_NODE_RPC_URL_OVERRIDE,
  process.env.NEXT_PUBLIC_NODE_WS_URL_OVERRIDE
);

export const zkp = new ZkProverClient(
  SHINAMI_SUPER_ACCESS_KEY,
  process.env.ZKPROVER_RPC_URL_OVERRIDE
);

export const zkw = new ZkWalletClient(
  SHINAMI_SUPER_ACCESS_KEY,
  process.env.ZKWALLET_RPC_URL_OVERRIDE
);

export const adminWallet = new ShinamiWalletSigner(
  ADMIN_WALLET_ID,
  wal,
  ADMIN_WALLET_SECRET,
  key
);
