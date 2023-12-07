import { gas, sui } from "@/lib/api/shinami";
import { Hero, LevelUpRequest, PACKAGE_ID } from "@/lib/shared/hero";
import {
  WithOwner,
  WithTxDigest,
  parseObjectWithOwner,
} from "@/lib/shared/sui";
import { buildGaslessTransactionBytes } from "@shinami/clients";
import {
  GaslessTransactionBytesBuilder,
  InvalidRequest,
  TransactionResponseParser,
  zkLoginSponsoredTxExecHandler,
} from "@shinami/nextjs-zklogin/server/pages";
import { validate } from "superstruct";

const buildTx: GaslessTransactionBytesBuilder = async (req) => {
  const { id } = req.query;
  const [error, body] = validate(req.body, LevelUpRequest);
  if (error) throw new InvalidRequest(error.message);

  const gaslessTxBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${PACKAGE_ID}::hero::level_up_hero`,
        arguments: [
          txb.object(id as string),
          txb.object(body.ticketId),
          txb.pure(body.damage),
          txb.pure(body.speed),
          txb.pure(body.defense),
        ],
      });
    },
  });
  return { gaslessTxBytes, gasBudget: 5_000_000 };
};

const parseTxRes: TransactionResponseParser<
  Hero & WithOwner & WithTxDigest
> = async (req, { digest }) => {
  const { id } = req.query;
  const hero = parseObjectWithOwner(
    await sui.getObject({
      id: id as string,
      options: { showContent: true, showOwner: true },
    }),
    Hero
  );
  return { ...hero, txDigest: digest };
};

export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes);
