import {
  QueryFunctionContext,
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Struct, create, intersection } from "superstruct";
import { ApiErrorBody } from "../shared/error";
import {
  HERO_MOVE_TYPE,
  Hero,
  LEVEL_UP_TICKET_MOVE_TYPE,
  LevelUpRequest,
  LevelUpTicket,
  MINT_TICKET_MOVE_TYPE,
  MintHeroRequest,
  MintTicket,
  MintTicketRequest,
  WithHero,
  WithLevelUpTicket,
  WithMintTicket,
} from "../shared/hero";
import {
  SendTarget,
  WithOwner,
  WithTxDigest,
  ownerAddress,
} from "../shared/sui";
import { Wallet } from "../shared/wallet";
import { suiObjectQueryKey, suiOwnedObjectsQueryKey } from "./sui";

export class ApiError extends Error {
  constructor(error: ApiErrorBody) {
    super(error.error);
  }
}

function apiQueryFn<T>(schema: Struct<T>) {
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
    queryKey: ["api", "/api/wallet"],
    queryFn: apiQueryFn(Wallet),
    staleTime: Infinity,
  });
}

function apiMutationFn<T, P>(
  uri: (params: P) => string,
  resultSchema: Struct<T>,
  body: (params: P) => any = (params) => params,
  method: string = "POST"
) {
  return async (params: P) => {
    const resp = await fetch(uri(params), {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body(params)),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new ApiError(create(data, ApiErrorBody));
    }
    return create(data, resultSchema);
  };
}

export function useNewMintTicket(): UseMutationResult<
  MintTicket & WithOwner & WithTxDigest,
  ApiError,
  MintTicketRequest
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiMutationFn(
      () => "/api/heroes/new_mint_ticket",
      intersection([WithMintTicket, WithOwner, WithTxDigest])
    ),
    onSuccess: (res) => {
      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries([
        ...suiOwnedObjectsQueryKey,
        owner,
        MINT_TICKET_MOVE_TYPE,
      ]);
      queryClient.invalidateQueries([...suiOwnedObjectsQueryKey, owner, null]);
    },
  });
}

export function useMintHero(): UseMutationResult<
  Hero & WithOwner & WithTxDigest,
  ApiError,
  MintHeroRequest
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiMutationFn(
      () => "/api/heroes/mint",
      intersection([WithHero, WithOwner, WithTxDigest])
    ),
    onSuccess: (res, { ticketId }) => {
      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries([
        ...suiOwnedObjectsQueryKey,
        owner,
        HERO_MOVE_TYPE,
      ]);
      queryClient.invalidateQueries([
        ...suiOwnedObjectsQueryKey,
        owner,
        MINT_TICKET_MOVE_TYPE,
      ]);
      queryClient.invalidateQueries([...suiOwnedObjectsQueryKey, owner, null]);
      queryClient.invalidateQueries([...suiObjectQueryKey, ticketId]);
    },
  });
}

export function useNewLevelUpTicket(): UseMutationResult<
  LevelUpTicket & WithOwner & WithTxDigest,
  ApiError,
  { heroId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiMutationFn(
      ({ heroId }) => `/api/heroes/${heroId}/new_level_up_ticket`,
      intersection([WithLevelUpTicket, WithOwner, WithTxDigest]),
      () => undefined
    ),
    onSuccess: (res) => {
      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries([
        ...suiOwnedObjectsQueryKey,
        owner,
        LEVEL_UP_TICKET_MOVE_TYPE,
      ]);
      queryClient.invalidateQueries([...suiOwnedObjectsQueryKey, owner, null]);
    },
  });
}

export function useLevelUpHero(): UseMutationResult<
  Hero & WithOwner & WithTxDigest,
  ApiError,
  { heroId: string } & LevelUpRequest
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiMutationFn(
      ({ heroId }) => `/api/heroes/${heroId}/level_up`,
      intersection([WithHero, WithOwner, WithTxDigest]),
      ({ heroId, ...req }) => req
    ),
    onSuccess: (res, { ticketId }) => {
      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries([
        ...suiOwnedObjectsQueryKey,
        owner,
        HERO_MOVE_TYPE,
      ]);
      queryClient.invalidateQueries([
        ...suiOwnedObjectsQueryKey,
        owner,
        LEVEL_UP_TICKET_MOVE_TYPE,
      ]);
      queryClient.invalidateQueries([...suiOwnedObjectsQueryKey, owner, null]);
      queryClient.invalidateQueries([...suiObjectQueryKey, ticketId]);
      queryClient.invalidateQueries([...suiObjectQueryKey, res.id.id]);
    },
  });
}

export function useBurnHero(): UseMutationResult<
  WithOwner & WithTxDigest,
  ApiError,
  { heroId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiMutationFn(
      ({ heroId }) => `/api/heroes/${heroId}`,
      intersection([WithOwner, WithTxDigest]),
      () => undefined,
      "DELETE"
    ),
    onSuccess: (res, { heroId }) => {
      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries([
        ...suiOwnedObjectsQueryKey,
        owner,
        HERO_MOVE_TYPE,
      ]);
      queryClient.invalidateQueries([...suiOwnedObjectsQueryKey, owner, null]);
      queryClient.invalidateQueries([...suiObjectQueryKey, heroId]);
    },
  });
}

export function useSendHero(): UseMutationResult<
  WithOwner & WithTxDigest,
  ApiError,
  { heroId: string } & SendTarget
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiMutationFn(
      ({ heroId }) => `/api/heroes/${heroId}/send`,
      intersection([WithOwner, WithTxDigest]),
      ({ heroId, ...req }) => req
    ),
    onSuccess: (res, { heroId }) => {
      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries([
        ...suiOwnedObjectsQueryKey,
        owner,
        HERO_MOVE_TYPE,
      ]);
      queryClient.invalidateQueries([...suiOwnedObjectsQueryKey, owner, null]);
      queryClient.invalidateQueries([...suiObjectQueryKey, heroId]);
    },
  });
}
