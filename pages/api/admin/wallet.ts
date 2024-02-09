/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { adminWallet } from "@/lib/api/shinami";
import { Wallet } from "@/lib/shared/wallet";
import { ApiErrorBody } from "@shinami/nextjs-zklogin";
import {
  methodDispatcher,
  withInternalErrorHandler,
} from "@shinami/nextjs-zklogin/server/pages/utils";
import { NextApiHandler } from "next";

const handler: NextApiHandler<Wallet | ApiErrorBody> = async (_, res) => {
  res.json({ address: await adminWallet.getAddress(true) });
};

export default withInternalErrorHandler(methodDispatcher({ GET: handler }));
