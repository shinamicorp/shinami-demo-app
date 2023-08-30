import {
  withMethodHandlers,
  withVerifiedEmailRequired,
} from "@/lib/api/handler";
import { getUserWallet } from "@/lib/api/shinami";
import { ApiErrorBody } from "@/lib/shared/error";
import { Wallet } from "@/lib/shared/wallet";
import { NextApiHandler } from "next";

const handler: NextApiHandler<Wallet | ApiErrorBody> = async (req, res) => {
  const userWallet = (await getUserWallet(req, res))!;
  res.json({ address: await userWallet.getAddress(true) });
};

export default withVerifiedEmailRequired(withMethodHandlers({ get: handler }));
