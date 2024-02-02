import {
  ApiError,
  WithKeyPair,
  apiMutationFn,
  apiTxExecMutationFn,
} from "@shinami/nextjs-zklogin/client";
import {
  QueryFunction,
  QueryFunctionContext,
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Struct, array, intersection, mask } from "superstruct";
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
  UpdateHeroRequest,
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
import { sui, suiObjectQueryKey, suiOwnedObjectsQueryKey } from "./sui";

// TODO - Export from nextjs-zklogin SDK.
function apiQueryFn<T = unknown>(schema?: Struct<T>): QueryFunction<T> {
  return async ({ queryKey }: QueryFunctionContext) => {
    const uri = queryKey.at(-1) as string;
    const resp = await fetch(uri, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const data = await resp.json();
    if (!resp.ok) throw new ApiError(resp.status, data);

    return schema ? mask(data, schema) : data;
  };
}

export function useHeroesSample(): UseQueryResult<Hero[], ApiError> {
  return useQuery({
    queryKey: ["api", "/api/heroes/sample"],
    queryFn: apiQueryFn(array(Hero)),
  });
}

export function useNewMintTicket(): UseMutationResult<
  MintTicket & WithOwner & WithTxDigest,
  ApiError,
  MintTicketRequest
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiMutationFn({
      uri: () => "/api/heroes/new_mint_ticket",
      resultSchema: intersection([WithMintTicket, WithOwner, WithTxDigest]),
    }),
    onSuccess: async (res) => {
      await sui.waitForTransactionBlock({ digest: res.txDigest });

      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, MINT_TICKET_MOVE_TYPE],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, null],
      });
    },
  });
}

export function useMintHero(): UseMutationResult<
  Hero & WithOwner & WithTxDigest,
  ApiError,
  MintHeroRequest & WithKeyPair
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: () => "/api/heroes/mint",
      resultSchema: intersection([WithHero, WithOwner, WithTxDigest]),
    }),
    onSuccess: async (res, { ticketId }) => {
      await sui.waitForTransactionBlock({ digest: res.txDigest });

      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, HERO_MOVE_TYPE],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, MINT_TICKET_MOVE_TYPE],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, null],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiObjectQueryKey, ticketId],
      });
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
    mutationFn: apiMutationFn({
      uri: ({ heroId }) => `/api/heroes/${heroId}/new_level_up_ticket`,
      body: () => undefined,
      resultSchema: intersection([WithLevelUpTicket, WithOwner, WithTxDigest]),
    }),
    onSuccess: async (res) => {
      await sui.waitForTransactionBlock({ digest: res.txDigest });

      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries({
        queryKey: [
          ...suiOwnedObjectsQueryKey,
          owner,
          LEVEL_UP_TICKET_MOVE_TYPE,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, null],
      });
    },
  });
}

export function useLevelUpHero(): UseMutationResult<
  Hero & WithOwner & WithTxDigest,
  ApiError,
  LevelUpRequest & { heroId: string } & WithKeyPair
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: ({ heroId }) => `/api/heroes/${heroId}/level_up`,
      body: ({ heroId, keyPair, ...req }) => req,
      resultSchema: intersection([WithHero, WithOwner, WithTxDigest]),
    }),
    onSuccess: async (res, { ticketId }) => {
      await sui.waitForTransactionBlock({ digest: res.txDigest });

      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, HERO_MOVE_TYPE],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...suiOwnedObjectsQueryKey,
          owner,
          LEVEL_UP_TICKET_MOVE_TYPE,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, null],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiObjectQueryKey, ticketId],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiObjectQueryKey, res.id.id],
      });
    },
  });
}

export function useBurnHero(): UseMutationResult<
  WithOwner & WithTxDigest,
  ApiError,
  { heroId: string } & WithKeyPair
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: ({ heroId }) => `/api/heroes/${heroId}/burn`,
      body: () => undefined,
      resultSchema: intersection([WithOwner, WithTxDigest]),
    }),
    onSuccess: async (res, { heroId }) => {
      await sui.waitForTransactionBlock({ digest: res.txDigest });

      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, HERO_MOVE_TYPE],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, null],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiObjectQueryKey, heroId],
      });
    },
  });
}

export function useSendHero(): UseMutationResult<
  WithOwner & WithTxDigest,
  ApiError,
  SendTarget & { heroId: string } & WithKeyPair
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: ({ heroId }) => `/api/heroes/${heroId}/send`,
      body: ({ heroId, keyPair, ...req }) => req,
      resultSchema: intersection([WithOwner, WithTxDigest]),
    }),
    onSuccess: async (res, { heroId }) => {
      await sui.waitForTransactionBlock({ digest: res.txDigest });

      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, HERO_MOVE_TYPE],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, null],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiObjectQueryKey, heroId],
      });
    },
  });
}

export function useUpdateHero(): UseMutationResult<
  Hero & WithOwner & WithTxDigest,
  ApiError,
  UpdateHeroRequest & { heroId: string } & WithKeyPair
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiTxExecMutationFn({
      baseUri: ({ heroId }) => `/api/heroes/${heroId}/update`,
      body: ({ heroId, keyPair, ...req }) => req,
      resultSchema: intersection([WithHero, WithOwner, WithTxDigest]),
    }),
    onSuccess: async (res) => {
      await sui.waitForTransactionBlock({ digest: res.txDigest });

      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, HERO_MOVE_TYPE],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, null],
      });
      queryClient.invalidateQueries({
        queryKey: [...suiObjectQueryKey, res.id.id],
      });
    },
  });
}
