import {
  ExecuteTransactionRequestType,
  SuiTransactionBlockResponse,
  SuiTransactionBlockResponseOptions,
} from "@mysten/sui.js";
import { Infer, object, string } from "superstruct";
import { ShinamiRpcClient, trimTrailingParams } from "./rpc";

const KEY_RPC_URL = "https://api.shinami.com/key/v1";
const WALLET_RPC_URL = "https://api.shinami.com/wallet/v1";

export class KeyClient extends ShinamiRpcClient {
  constructor(accessKey: string, url: string = KEY_RPC_URL) {
    super(accessKey, url);
  }

  createSession(secret: string): Promise<string> {
    return this.request("shinami_key_createSession", [secret], string());
  }
}

export const SignTransactionResult = object({
  signature: string(),
  txDigest: string(),
});
export type SignTransactionResult = Infer<typeof SignTransactionResult>;

export class WalletClient extends ShinamiRpcClient {
  constructor(accessKey: string, url: string = WALLET_RPC_URL) {
    super(accessKey, url);
  }

  createWallet(walletId: string, sessionToken: string): Promise<string> {
    return this.request(
      "shinami_wal_createWallet",
      [walletId, sessionToken],
      string()
    );
  }

  getWallet(walletId: string): Promise<string> {
    return this.request("shinami_wal_getWallet", [walletId], string());
  }

  signTransactionBlock(
    walletId: string,
    sessionToken: string,
    txBytes: string
  ): Promise<SignTransactionResult> {
    return this.request(
      "shinami_wal_signTransactionBlock",
      [walletId, sessionToken, txBytes],
      SignTransactionResult
    );
  }

  executeGaslessTransactionBlock(
    walletId: string,
    sessionToken: string,
    txBytes: string,
    gasBudget: number,
    options?: SuiTransactionBlockResponseOptions,
    requestType?: ExecuteTransactionRequestType
  ): Promise<SuiTransactionBlockResponse> {
    return this.request(
      "shinami_wal_executeGaslessTransactionBlock",
      trimTrailingParams([
        walletId,
        sessionToken,
        txBytes,
        gasBudget,
        options,
        requestType,
      ])
    );
  }
}
