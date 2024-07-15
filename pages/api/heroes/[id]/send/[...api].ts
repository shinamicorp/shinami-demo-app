/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { gas, sui } from "@/lib/api/shinami";
import { SendTarget, WithOwner, WithTxDigest } from "@/lib/shared/sui";
import { AuthContext } from "@/lib/shared/zklogin";
import { buildGaslessTransaction } from "@shinami/clients/sui";
import {
  GaslessTransactionBuilder,
  InvalidRequest,
  TransactionResponseParser,
  zkLoginSponsoredTxExecHandler,
} from "@shinami/nextjs-zklogin/server/pages";
import { validate } from "superstruct";

const buildTx: GaslessTransactionBuilder<AuthContext> = async (
  req,
  { oidProvider, authContext },
) => {
  const { id } = req.query;
  const [error, body] = validate(req.body, SendTarget);
  if (error) throw new InvalidRequest(error.message);

  console.debug(
    "Sending hero %s to %s for %s user %s",
    id,
    body.recipient,
    oidProvider,
    authContext.email,
  );

  return await buildGaslessTransaction(
    async (txb) => {
      txb.transferObjects(
        [txb.object(id as string)],
        txb.pure.address(body.recipient),
      );
    },
    { sui },
  );
};

const parseTxRes: TransactionResponseParser<
  AuthContext,
  WithOwner & WithTxDigest
> = async (_, { digest }, { wallet }) => ({
  owner: { AddressOwner: wallet },
  txDigest: digest,
});

export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes);
