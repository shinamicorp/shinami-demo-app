/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { gas, sui } from "@/lib/api/shinami";
import { Hero, LevelUpRequest, PACKAGE_ID } from "@/lib/shared/hero";
import {
  WithOwner,
  WithTxDigest,
  parseObject,
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
  { oidProvider, authContext },
) => {
  const { id } = req.query;
  const [error, body] = validate(req.body, LevelUpRequest);
  if (error) throw new InvalidRequest(error.message);

  const hero = parseObject(
    await sui.getObject({
      id: id as string,
      options: { showContent: true },
    }),
    Hero,
  );
  if (
    hero.damage + body.damage > 10 ||
    hero.speed + body.speed > 10 ||
    hero.defense + body.defense > 10
  )
    throw new InvalidRequest("Attribute points out of range");

  console.debug(
    "Leveling up hero %s for %s user %s",
    id,
    oidProvider,
    authContext.email,
  );

  return await buildGaslessTransaction(
    async (txb) => {
      txb.moveCall({
        target: `${PACKAGE_ID}::hero::level_up_hero`,
        arguments: [
          txb.object(id as string),
          txb.object(body.ticketId),
          txb.pure.u8(body.damage),
          txb.pure.u8(body.speed),
          txb.pure.u8(body.defense),
        ],
      });
    },
    { sui },
  );
};

const parseTxRes: TransactionResponseParser<
  AuthContext,
  Hero & WithOwner & WithTxDigest
> = async (req, { digest }) => {
  const { id } = req.query;
  const hero = parseObjectWithOwner(
    await sui.getObject({
      id: id as string,
      options: { showContent: true, showOwner: true },
    }),
    Hero,
  );
  return { ...hero, txDigest: digest };
};

export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes);
