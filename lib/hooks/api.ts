import {
  ApiError,
  WithKeyPair,
  apiMutationFn,
  apiTxExecMutationFn,
} from "@shinami/nextjs-zklogin/client";
import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { intersection } from "superstruct";
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
import { suiObjectQueryKey, suiOwnedObjectsQueryKey } from "./sui";

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
    onSuccess: (res) => {
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
    onSuccess: (res, { ticketId }) => {
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
    onSuccess: (res) => {
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
    onSuccess: (res, { ticketId }) => {
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
    onSuccess: (res, { heroId }) => {
      const owner = ownerAddress(res.owner);
      queryClient.invalidateQueries({
        queryKey: [...suiOwnedObjectsQueryKey, owner, HERO_MOVE_TYPE],
        refetchType: "all",
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
    onSuccess: (res, { heroId }) => {
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
    onSuccess: (res) => {
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
