import { Connection, JsonRpcProvider } from "@mysten/sui.js";

const NODE_RPC_URL = "https://api.shinami.com/node/v1";
const NODE_WS_URL = "wss://api.shinami.com/node/v1";

export function createSuiProvider(
  accessKey: string,
  url: string = NODE_RPC_URL,
  wsUrl: string = NODE_WS_URL
): JsonRpcProvider {
  return new JsonRpcProvider(
    new Connection({
      fullnode: `${url}/${accessKey}`,
      websocket: `${wsUrl}/${accessKey}`,
    })
  );
}
