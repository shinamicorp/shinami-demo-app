import { runWithAdminCap } from "@/lib/api/admin";
import { adminWallet, sui } from "@/lib/api/shinami";
import { MintTicket, MintTicketRequest, PACKAGE_ID } from "@/lib/shared/hero";
import {
  WithOwner,
  WithTxDigest,
  parseObjectWithOwner,
} from "@/lib/shared/sui";
import { buildGaslessTransactionBytes } from "@shinami/clients";
import { ApiErrorBody } from "@shinami/nextjs-zklogin";
import { withZkLoginUserRequired } from "@shinami/nextjs-zklogin/server/pages";
import {
  methodDispatcher,
  withInternalErrorHandler,
} from "@shinami/nextjs-zklogin/server/pages/utils";
import { validate } from "superstruct";

const handler = withZkLoginUserRequired<
  (MintTicket & WithOwner & WithTxDigest) | ApiErrorBody
>(sui, async (req, res, { wallet }) => {
  const [error, body] = validate(req.body, MintTicketRequest);
  if (error) return res.status(400).json({ error: error.message });

  const txResp = await runWithAdminCap(async (cap) => {
    const txBytes = await buildGaslessTransactionBytes({
      sui,
      build: async (txb) => {
        const ticket = txb.moveCall({
          target: `${PACKAGE_ID}::hero::new_mint_ticket`,
          arguments: [
            txb.object(cap),
            txb.pure(body.character),
            txb.pure(0),
            txb.pure(10),
          ],
        });
        txb.moveCall({
          target: `${PACKAGE_ID}::hero::transfer_mint_ticket`,
          arguments: [txb.object(cap), ticket, txb.pure(wallet)],
        });
      },
    });

    return await adminWallet.executeGaslessTransactionBlock(
      txBytes,
      5_000_000,
      { showEffects: true }
    );
  });

  if (txResp.effects?.status.status !== "success") {
    console.error("Tx execution failed", txResp);
    return res.status(500).json({
      error: `Tx execution failed: ${txResp.effects?.status.error}`,
    });
  }

  const ref = txResp.effects?.created?.at(0)?.reference;
  if (!ref) {
    console.error("Object not created", txResp);
    return res.status(500).json({ error: "Object not created" });
  }

  const ticket = parseObjectWithOwner(
    await sui.getObject({
      id: ref.objectId,
      options: { showContent: true, showOwner: true },
    }),
    MintTicket
  );
  res.json({ ...ticket, txDigest: txResp.digest });
});

export default withInternalErrorHandler(methodDispatcher({ POST: handler }));
