/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { gas, sui } from "@/lib/api/shinami";
import { PACKAGE_ID } from "@/lib/shared/hero";
import { WithOwner, WithTxDigest } from "@/lib/shared/sui";
import { AuthContext } from "@/lib/shared/zklogin";
import { buildGaslessTransaction } from "@shinami/clients/sui";
import {
  GaslessTransactionBuilder,
  TransactionResponseParser,
  zkLoginSponsoredTxExecHandler,
} from "@shinami/nextjs-zklogin/server/pages";

const buildTx: GaslessTransactionBuilder<AuthContext> = async (
  req,
  { oidProvider, authContext },
) => {
  const { id } = req.query;

  console.debug(
    "Burning hero %s for %s user %s",
    id,
    oidProvider,
    authContext.email,
  );

  return await buildGaslessTransaction(
    async (txb) => {
      txb.moveCall({
        target: `${PACKAGE_ID}::hero::burn_hero`,
        arguments: [txb.object(id as string)],
      });
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
