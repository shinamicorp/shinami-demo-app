import { gas, sui } from "@/lib/api/shinami";
import { SendTarget, WithOwner, WithTxDigest } from "@/lib/shared/sui";
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
  const [error, body] = validate(req.body, SendTarget);
  if (error) throw new InvalidRequest(error.message);

  const gaslessTxBytes = await buildGaslessTransactionBytes({
    sui,
    build: async (txb) => {
      txb.transferObjects([txb.object(id as string)], txb.pure(body.recipient));
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
