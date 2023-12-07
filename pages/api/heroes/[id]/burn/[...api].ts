import { gas, sui } from "@/lib/api/shinami";
import { PACKAGE_ID } from "@/lib/shared/hero";
import { WithOwner, WithTxDigest } from "@/lib/shared/sui";
import { buildGaslessTransactionBytes } from "@shinami/clients";
import {
  GaslessTransactionBytesBuilder,
  TransactionResponseParser,
  zkLoginSponsoredTxExecHandler,
} from "@shinami/nextjs-zklogin/server/pages";

const buildTx: GaslessTransactionBytesBuilder = async (req) => {
  const { id } = req.query;
  const gaslessTxBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.moveCall({
        target: `${PACKAGE_ID}::hero::burn_hero`,
        arguments: [txb.object(id as string)],
      });
    },
  });
  return { gaslessTxBytes, gasBudget: 5_000_000 };
};

const parseTxRes: TransactionResponseParser<WithOwner & WithTxDigest> = async (
  _,
  { digest },
  { wallet }
) => ({
  owner: { AddressOwner: wallet },
  txDigest: digest,
});

export default zkLoginSponsoredTxExecHandler(sui, gas, buildTx, parseTxRes);
