import { JsonRpcProvider, TransactionBlock, toB64 } from "@mysten/sui.js";
import { Infer, enums, number, object, string } from "superstruct";
import { ShinamiRpcClient } from "./rpc";

const GAS_STATION_RPC_URL = "https://api.shinami.com/gas/v1";

export const SponsoredTransaction = object({
  txBytes: string(),
  txDigest: string(),
  signature: string(),
  expireAtTime: number(),
  expireAfterEpoch: number(),
});
export type SponsoredTransaction = Infer<typeof SponsoredTransaction>;

export const SponsoredTransactionStatus = enums([
  "IN_FLIGHT",
  "COMPLETE",
  "INVALID",
]);
export type SponsoredTransactionStatus = Infer<
  typeof SponsoredTransactionStatus
>;

export class GasStationClient extends ShinamiRpcClient {
  constructor(accessKey: string, url: string = GAS_STATION_RPC_URL) {
    super(accessKey, url);
  }

  sponsorTransactionBlock(
    txBytes: string,
    sender: string,
    gasBudget: number
  ): Promise<SponsoredTransaction> {
    return this.request(
      "gas_sponsorTransactionBlock",
      [txBytes, sender, gasBudget],
      SponsoredTransaction
    );
  }

  getSponsoredTransactionBlockStatus(
    txDigest: string
  ): Promise<SponsoredTransactionStatus> {
    return this.request(
      "gas_getSponsoredTransactionBlockStatus",
      [txDigest],
      SponsoredTransactionStatus
    );
  }
}

export async function buildGaslessTransactionBytes(
  txb: TransactionBlock,
  sui: JsonRpcProvider,
  estimateGasBudget: boolean = false,
  sender?: string
) {
  const txBytes = toB64(
    await txb.build({
      provider: sui,
      onlyTransactionKind: true,
    })
  );
  if (estimateGasBudget) {
    const {
      effects: { gasUsed },
    } = await sui.devInspectTransactionBlock({
      transactionBlock: txBytes,
      sender: sender ?? "",
    });
    console.log("gasUsed", gasUsed);
    const gasBudget =
      parseInt(gasUsed.computationCost) + parseInt(gasUsed.storageCost);
    console.log("gasBudget", gasBudget);

    return { txBytes, gasBudget };
  } else {
    return { txBytes };
  }
}
