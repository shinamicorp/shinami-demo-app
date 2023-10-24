import { gas, sui } from "@/lib/api/shinami";
import { Hero, PACKAGE_ID, UpdateHeroRequest } from "@/lib/shared/hero";
import {
  WithOwner,
  WithTxDigest,
  parseObjectWithOwner,
} from "@/lib/shared/sui";
import {
  GaslessTransactionBytesBuilder,
  InvalidRequest,
  TransactionResponseParser,
  zkLoginSponsoredTxExecHandler,
} from "@shinami/nextjs-zklogin/server/pages";
import { buildGaslessTransactionBytes } from "shinami";
import { validate } from "superstruct";

const buildTx: GaslessTransactionBytesBuilder = async (req) => {
  const { id } = req.query;
  const [error, body] = validate(req.body, UpdateHeroRequest);
  if (error) throw new InvalidRequest(error.message);

  const gaslessTxBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${PACKAGE_ID}::hero::rename_hero`,
        arguments: [txb.object(id as string), txb.pure(body.name)],
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
