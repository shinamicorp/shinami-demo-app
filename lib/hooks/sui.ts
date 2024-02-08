/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaginatedObjectsResponse } from "@mysten/sui.js/client";
import { createSuiClient } from "@shinami/clients";
import {
  UseInfiniteQueryResult,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { Struct } from "superstruct";
import { getOwnedObjects, parseObject } from "../shared/sui";
import { throwExpression } from "../shared/utils";

const SUI_NETWORK =
  process.env.NEXT_PUBLIC_SUI_NETWORK ??
  throwExpression(new Error("NEXT_PUBLIC_SUI_NETWORK not configured"));
const SUI_EXPLORER_BASE_URL = "https://suiexplorer.com";
const SUI_VISION_BASE_URL = `https://${
  SUI_NETWORK === "mainnet" ? "" : `${SUI_NETWORK}.`
}suivision.xyz`;

// A separate sui client for frontend only, using the node key.
// This is so we can enable different access controls on the node key and the super key.
export const sui = createSuiClient(
  process.env.NEXT_PUBLIC_SHINAMI_NODE_ACCESS_KEY ??
    throwExpression(
      new Error("NEXT_PUBLIC_SHINAMI_NODE_ACCESS_KEY not configured")
    ),
  process.env.NEXT_PUBLIC_NODE_RPC_URL_OVERRIDE,
  process.env.NEXT_PUBLIC_NODE_WS_URL_OVERRIDE
);

export function getSuiExplorerAccountUrl(
  address: string,
  suiVision: boolean = false
) {
  return suiVision
    ? `${SUI_VISION_BASE_URL}/account/${address}`
    : `${SUI_EXPLORER_BASE_URL}/address/${address}?network=${SUI_NETWORK}`;
}

export function getSuiExplorerObjectUrl(
  address: string,
  suiVision: boolean = false
) {
  return suiVision
    ? `${SUI_VISION_BASE_URL}/object/${address}`
    : `${SUI_EXPLORER_BASE_URL}/object/${address}?network=${SUI_NETWORK}`;
}

export function getSuiExplorerTransactionUrl(
  digest: string,
  suiVision: boolean = false
) {
  return suiVision
    ? `${SUI_VISION_BASE_URL}/txblock/${digest}`
    : `${SUI_EXPLORER_BASE_URL}/txblock/${digest}?network=${SUI_NETWORK}`;
}

export const suiOwnedObjectsQueryKey = ["sui", "getOwnedObjects"];

export function usePaginatedSuiOwnedObject(
  owner: string | undefined, // if undefined, the query will be disabled
  type?: string,
  pageSize: number = 10
): UseInfiniteQueryResult<PaginatedObjectsResponse> {
  return useInfiniteQuery({
    enabled: !!owner,
    queryKey: [
      ...suiOwnedObjectsQueryKey,
      owner,
      type === undefined ? null : type, // use null to indicate any type
      pageSize,
    ],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      return await sui.getOwnedObjects({
        owner: owner!,
        filter: type ? { MatchAll: [{ StructType: type }] } : undefined,
        options: { showContent: true },
        cursor: pageParam,
        limit: pageSize,
      });
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) return lastPage.nextCursor;
    },
  });
}

export function useParsedSuiOwnedObjects<T>(
  owner: string | undefined, // if undefined, the query will be disabled
  type: string,
  schema: Struct<T>,
  limit?: number
) {
  return useQuery({
    enabled: !!owner,
    queryKey: [...suiOwnedObjectsQueryKey, owner, type, limit],
    queryFn: async () => {
      const result: T[] = [];
      if (limit !== undefined && limit <= 0) return result;

      for await (const obj of getOwnedObjects(sui, owner!, type)) {
        const parsed = parseObject(obj, schema);
        result.push(parsed);
        if (limit !== undefined && result.length >= limit) break;
      }
      return result;
    },
  });
}

export const suiObjectQueryKey = ["sui", "getObject"];

export function useParsedSuiObject<T>(
  id: string | undefined, // if undefined, the query will be disabled
  schema: Struct<T>
) {
  return useQuery({
    enabled: !!id,
    queryKey: [...suiObjectQueryKey, id],
    queryFn: async () => {
      const obj = await sui.getObject({
        id: id!,
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
