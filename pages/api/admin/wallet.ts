import { withMethodHandlers } from "@/lib/api/handler";
import { adminWallet } from "@/lib/api/shinami";
import { ApiErrorBody } from "@/lib/shared/error";
import { Wallet } from "@/lib/shared/wallet";
import { NextApiHandler } from "next";

const handler: NextApiHandler<Wallet | ApiErrorBody> = async (req, res) => {
  res.json({ address: await adminWallet.getAddress(true) });
};

export default withMethodHandlers({ get: handler });
