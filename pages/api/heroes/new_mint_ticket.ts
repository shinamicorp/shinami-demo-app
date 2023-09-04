import { runWithAdminCap } from "@/lib/api/admin";
import {
  withMethodHandlers,
  withVerifiedEmailRequired,
} from "@/lib/api/handler";
import { adminWallet, getUserWallet } from "@/lib/api/shinami";
import { ApiErrorBody } from "@/lib/shared/error";
import { MintTicket, MintTicketRequest, PACKAGE_ID } from "@/lib/shared/hero";
import {
  WithOwner,
  WithTxDigest,
  parseObjectWithOwner,
  sui,
} from "@/lib/shared/sui";
import { NextApiHandler } from "next";
import { buildGaslessTransactionBytes } from "shinami";
import { validate } from "superstruct";

const handler: NextApiHandler<
  (MintTicket & WithOwner & WithTxDigest) | ApiErrorBody
> = async (req, res) => {
  const [error, body] = validate(req.body, MintTicketRequest);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const userWallet = (await getUserWallet(req, res))!;

  // To optimize tx throughput involving admin cap, it's better to pre-issue a batch of tickets
  // (with admin cap) and simply transer them to users' wallets upon request. The transfer tx
  // doesn't require admin cap. We didn't implement this optimization in this demo.
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
          arguments: [
            txb.object(cap),
            ticket,
            txb.pure(await userWallet.getAddress(true)),
          ],
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

  // Workaround for routing inconsistency between this client and wallet service
  await sui.waitForTransactionBlock({
    digest: txResp.digest,
    timeout: 30_000,
    pollInterval: 1_000,
  });

  const ticket = parseObjectWithOwner(
    await sui.getObject({
      id: ref.objectId,
      options: { showContent: true, showOwner: true },
    }),
    MintTicket
  );
  res.json({ ...ticket, txDigest: txResp.digest });
};

export default withVerifiedEmailRequired(withMethodHandlers({ post: handler }));
