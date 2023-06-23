import { useMemo } from "react";

const SUI_EXPLORER_BASE_URL = "https://suiexplorer.com";
const SUI_EXPLORER_NETWORK =
  process.env.NEXT_PUBLIC_SUI_EXPLORER_NETWORK ?? "mainnet";

export function useSuiExplorerAddressUrl(address: string) {
  return useMemo(
    () =>
      `${SUI_EXPLORER_BASE_URL}/address/${address}?network=${SUI_EXPLORER_NETWORK}`,
    [address]
  );
}

export function useSuiExplorerObjectUrl(address: string) {
  return useMemo(
    () =>
      `${SUI_EXPLORER_BASE_URL}/object/${address}?network=${SUI_EXPLORER_NETWORK}`,
    [address]
  );
}
