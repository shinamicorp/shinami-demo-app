import { gas, sui } from "@/lib/api/shinami";
import { Hero, MintHeroRequest, PACKAGE_ID } from "@/lib/shared/hero";
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

const buildTx: GaslessTransactionBytesBuilder = async (req, { wallet }) => {
  const [error, body] = validate(req.body, MintHeroRequest);
  if (error) throw new InvalidRequest(error.message);

  const gaslessTxBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      const hero = txb.moveCall({
        target: `${PACKAGE_ID}::hero::mint_hero`,
        arguments: [
          txb.object(body.ticketId),
          txb.pure(body.name),
          txb.pure(body.damage),
          txb.pure(body.speed),
          txb.pure(body.defense),
        ],
      });
      txb.transferObjects([hero], txb.pure(wallet));
    },
  });

  return { gaslessTxBytes, gasBudget: 5_000_000 };
};

const parseTxRes: TransactionResponseParser<
  Hero & WithOwner & WithTxDigest
> = async (_, txRes) => {
  const ref = txRes.effects?.created?.at(0)?.reference;
  if (!ref) {
    console.error("Object not created", txRes);
    throw new Error("Object not created");
  }

  const hero = parseObjectWithOwner(
    await sui.getObject({
      id: ref.objectId,
      options: { showContent: true, showOwner: true },
    }),
    Hero
  );
  return { ...hero, txDigest: txRes.digest };
};

export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes);
