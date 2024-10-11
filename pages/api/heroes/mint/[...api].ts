/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { gas, sui } from "@/lib/api/shinami";
import { Hero, MintHeroRequest, PACKAGE_ID } from "@/lib/shared/hero";
import {
  WithOwner,
  WithTxDigest,
  parseObjectWithOwner,
} from "@/lib/shared/sui";
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
  { wallet, oidProvider, authContext },
) => {
  const [error, body] = validate(req.body, MintHeroRequest);
  if (error) throw new InvalidRequest(error.message);

  console.debug(
    "Minting new hero for %s user %s",
    oidProvider,
    authContext.email,
  );

  return await buildGaslessTransaction(
    async (txb) => {
      const hero = txb.moveCall({
        target: `${PACKAGE_ID}::hero::mint_hero`,
        arguments: [
          txb.object(body.ticketId),
          txb.pure.string(body.name),
          txb.pure.u8(body.damage),
          txb.pure.u8(body.speed),
          txb.pure.u8(body.defense),
        ],
      });
      txb.transferObjects([hero], txb.pure.address(wallet));
    },
    { sui },
  );
};

const parseTxRes: TransactionResponseParser<
  AuthContext,
  Hero & WithOwner & WithTxDigest
> = async (_, txRes) => {
  const ref = txRes.effects?.created?.at(0)?.reference;
  if (!ref) {
    console.error("Object not created", txRes);
    throw new Error("Object not created");
  }
  await sui.waitForTransaction({ digest: txRes.digest });

  const hero = parseObjectWithOwner(
    await sui.getObject({
      id: ref.objectId,
      options: { showContent: true, showOwner: true },
    }),
    Hero,
  );
  return { ...hero, txDigest: txRes.digest };
};

export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes);
