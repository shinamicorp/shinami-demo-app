import { PaginatedObjectsResponse } from "@mysten/sui.js/client";
import {
  UseInfiniteQueryResult,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { createSuiClient } from "shinami";
import { Struct } from "superstruct";
import { throwExpression } from "../shared/error";
import { getOwnedObjects, parseObject } from "../shared/sui";

const SUI_EXPLORER_BASE_URL = "https://suiexplorer.com";
const SUI_EXPLORER_NETWORK =
  process.env.NEXT_PUBLIC_SUI_EXPLORER_NETWORK ?? "mainnet";

// A separate sui client for frontend only, using the node key.
// This is so we can enable different access controls on the node key and the super key.
export const sui = createSuiClient(
  process.env.NEXT_PUBLIC_NODE_ACCESS_KEY ??
    throwExpression(new Error("NEXT_PUBLIC_NODE_ACCESS_KEY not configured")),
  process.env.NEXT_PUBLIC_NODE_RPC_URL_OVERRIDE,
  process.env.NEXT_PUBLIC_NODE_WS_URL_OVERRIDE
);

export function getSuiExplorerAddressUrl(address: string) {
  return `${SUI_EXPLORER_BASE_URL}/address/${address}?network=${SUI_EXPLORER_NETWORK}`;
}

export function getSuiExplorerObjectUrl(address: string) {
  return `${SUI_EXPLORER_BASE_URL}/object/${address}?network=${SUI_EXPLORER_NETWORK}`;
}

export const suiOwnedObjectsQueryKey = ["sui", "getOwnedObjects"];

export function usePaginatedSuiOwnedObject(
  owner: string,
  type?: string,
  pageSize: number = 10
): UseInfiniteQueryResult<PaginatedObjectsResponse> {
  return useInfiniteQuery({
    queryKey: [
      ...suiOwnedObjectsQueryKey,
      owner,
      type === undefined ? null : type, // use null to indicate any type
      pageSize,
    ],
    queryFn: async ({ pageParam }) => {
      return await sui.getOwnedObjects({
        owner,
        filter: type ? { MatchAll: [{ StructType: type }] } : undefined,
        options: { showContent: true },
        cursor: pageParam,
        limit: pageSize,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) return lastPage.nextCursor;
    },
  });
}

export function useParsedSuiOwnedObjects<T>(
  owner: string,
  type: string,
  schema: Struct<T>,
  predicate?: (obj: T) => boolean,
  limit?: number
) {
  return useQuery({
    queryKey: [...suiOwnedObjectsQueryKey, owner, type],
    queryFn: async () => {
      const result: T[] = [];
      if (limit !== undefined && limit <= 0) return result;

      for await (const obj of getOwnedObjects(sui, owner, type)) {
        const parsed = parseObject(obj, schema);
        if (!predicate || predicate(parsed)) result.push(parsed);
        if (limit !== undefined && result.length >= limit) break;
      }
      return result;
    },
  });
}

export const suiObjectQueryKey = ["sui", "getObject"];

export function useParsedSuiObject<T>(id: string, schema: Struct<T>) {
  return useQuery({
    queryKey: [...suiObjectQueryKey, id],
    queryFn: async () => {
      const obj = await sui.getObject({
        id,
        options: { showContent: true, showOwner: true },
      });
      const parsed = parseObject(obj, schema);
      return {
        content: parsed,
        owner: obj.data?.owner!,
      };
    },
  });
}
