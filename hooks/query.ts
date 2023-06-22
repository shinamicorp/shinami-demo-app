import { ApiErrorBody } from "@/lib/error";
import { Hero, MintHero } from "@/lib/hero";
import { Wallet } from "@/lib/wallet";
import { createSuiProvider } from "@/sdk/shinami/sui";
import {
  PaginatedObjectsResponse,
  SuiObjectResponseQuery,
} from "@mysten/sui.js";
import {
  QueryFunctionContext,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Struct, create, literal } from "superstruct";

export class ApiError extends Error {
  constructor(error: ApiErrorBody) {
    super(error.error);
  }
}

function internalQueryFn<T>(schema: Struct<T>) {
  return async ({ queryKey }: QueryFunctionContext) => {
    const uri = queryKey.at(-1) as string;
    const resp = await fetch(uri, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new ApiError(create(data, ApiErrorBody));
    }
    return create(data, schema);
  };
}

export function useWallet(): UseQueryResult<Wallet, ApiError> {
  return useQuery({
    queryKey: ["internal", "/api/wallet"],
    queryFn: internalQueryFn(Wallet),
  });
}

const sui = createSuiProvider(
  process.env.NEXT_PUBLIC_NODE_ACCESS_KEY!,
  process.env.NEXT_PUBLIC_NODE_RPC_URL_OVERRIDE,
  process.env.NEXT_PUBLIC_NODE_WS_URL_OVERRIDE
);

export const suiOwnedObjectsQueryKey = ["sui", "getOwnedObjects"];

export function useSuiOwnedObjects(
  owner: string,
  params?: SuiObjectResponseQuery,
  pageSize: number = 10
): UseInfiniteQueryResult<PaginatedObjectsResponse, Object> {
  return useInfiniteQuery({
    queryKey: [...suiOwnedObjectsQueryKey, owner, params, pageSize],
    queryFn: async ({ pageParam }) => {
      return await sui.getOwnedObjects({
        owner,
        ...params,
        cursor: pageParam,
        limit: pageSize,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) return lastPage.nextCursor;
    },
  });
}

export async function mutateInternal<T, V = void>(
  uri: string,
  resultSchema: Struct<T>,
  body?: V,
  method: string = "POST"
) {
  const resp = await fetch(uri, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new ApiError(create(data, ApiErrorBody));
  }
  return create(data, resultSchema);
}

export function useMintHero(
  owner: string
): UseMutationResult<Hero, ApiError, MintHero> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => mutateInternal("/api/heroes", Hero, params),
    onSuccess: () =>
      queryClient.invalidateQueries([...suiOwnedObjectsQueryKey, owner]),
  });
}

export function useBurnHero(
  owner: string
): UseMutationResult<boolean, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (address: string) =>
      mutateInternal(
        `/api/heroes/${address}`,
        literal(true),
        undefined,
        "DELETE"
      ),
    onSuccess: () =>
      queryClient.invalidateQueries([...suiOwnedObjectsQueryKey, owner]),
  });
}
