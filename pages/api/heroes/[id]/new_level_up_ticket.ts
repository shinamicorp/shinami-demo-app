import { runWithAdminCap } from "@/lib/api/admin";
import { adminWallet, sui } from "@/lib/api/shinami";
import { LevelUpTicket, PACKAGE_ID } from "@/lib/shared/hero";
import {
  WithOwner,
  WithTxDigest,
  parseObjectWithOwner,
} from "@/lib/shared/sui";
import { AuthContext } from "@/lib/shared/zklogin";
import { buildGaslessTransactionBytes } from "@shinami/clients";
import { ApiErrorBody } from "@shinami/nextjs-zklogin";
import { withZkLoginUserRequired } from "@shinami/nextjs-zklogin/server/pages";
import {
  methodDispatcher,
  withInternalErrorHandler,
} from "@shinami/nextjs-zklogin/server/pages/utils";

const handler = withZkLoginUserRequired<
  (LevelUpTicket & WithOwner & WithTxDigest) | ApiErrorBody
>(sui, async (req, res, { wallet, oidProvider, authContext }) => {
  const { id } = req.query;

  console.debug(
    "Creating new level up ticket for %s user %s",
    oidProvider,
    (authContext as AuthContext).email
  );

  // To optimize tx throughput involving admin cap, it's better to pre-issue a batch of tickets
  // (with admin cap) and simply transer them to users' wallets upon request. The transfer tx
  // doesn't require admin cap. We didn't implement this optimization in this demo.
  const txResp = await runWithAdminCap(async (cap) => {
    const txBytes = await buildGaslessTransactionBytes({
      sui,
      build: async (txb) => {
        const ticket = txb.moveCall({
          target: `${PACKAGE_ID}::hero::new_level_up_ticket`,
          arguments: [
            txb.object(cap),
            txb.pure(id as string),
            txb.pure(4), // 4 more atrribute points
          ],
        });
        txb.transferObjects([ticket], txb.pure(wallet));
      },
    });

    return await adminWallet.executeGaslessTransactionBlock(
      txBytes,
      undefined,
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
    LevelUpTicket
  );
  res.json({ ...ticket, txDigest: txResp.digest });
});

export default withInternalErrorHandler(methodDispatcher({ POST: handler }));
