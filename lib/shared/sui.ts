import {
  ObjectOwner as SuiObjectOwner,
  SuiObjectResponse,
} from "@mysten/sui.js/client";
import { createSuiClient } from "shinami";
import {
  Describe,
  Infer,
  Struct,
  create,
  literal,
  object,
  string,
  type,
  union,
} from "superstruct";
import { throwExpression } from "./error";

export const sui = createSuiClient(
  process.env.NEXT_PUBLIC_NODE_ACCESS_KEY ??
    throwExpression(new Error("NEXT_PUBLIC_NODE_ACCESS_KEY not configured")),
  process.env.NEXT_PUBLIC_NODE_RPC_URL_OVERRIDE,
  process.env.NEXT_PUBLIC_NODE_WS_URL_OVERRIDE
);

export const ObjectId = object({
  id: string(),
});
export type ObjectId = Infer<typeof ObjectId>;

export const WithTxDigest = type({
  txDigest: string(),
});
export type WithTxDigest = Infer<typeof WithTxDigest>;

export const ObjectOwner: Describe<SuiObjectOwner> = union([
  object({
    AddressOwner: string(),
  }),
  object({
    ObjectOwner: string(),
  }),
  object({
    Shared: object({
      initial_shared_version: string(),
    }),
  }),
  literal("Immutable"),
]);
export type ObjectOwner = SuiObjectOwner;

export const WithOwner = type({
  owner: ObjectOwner,
});
export type WithOwner = Infer<typeof WithOwner>;

export const SendTarget = object({
  recipient: string(),
});
export type SendTarget = Infer<typeof SendTarget>;

export async function* getOwnedObjects(
  owner: string,
  type?: string
): AsyncGenerator<SuiObjectResponse> {
  let more = true;
  let cursor: string | null | undefined = undefined;

  while (more) {
    const page = await sui.getOwnedObjects({
      owner,
      cursor,
      filter: type
        ? {
            MatchAll: [{ StructType: type }],
          }
        : undefined,
      options: { showContent: true },
    });

    for (const resp of page.data) {
      yield resp;
    }

    more = page.hasNextPage;
    cursor = page.nextCursor;
  }
}

export function parseObject<T>(obj: SuiObjectResponse, schema: Struct<T>): T {
  const content = obj.data?.content;
  if (content?.dataType !== "moveObject") {
    throw new Error("Response content doesn't contain a move object");
  }
  return create(content.fields, schema);
}

export function parseObjectWithOwner<T>(
  obj: SuiObjectResponse,
  schema: Struct<T>
): T & WithOwner {
  if (!obj.data?.owner) {
    throw new Error("Response doesn't contain an owner");
  }
  return {
    ...parseObject(obj, schema),
    owner: obj.data?.owner,
  };
}

export function ownerAddress(owner: ObjectOwner): string {
  if (owner !== "Immutable") {
    if ("AddressOwner" in owner) return owner.AddressOwner;
    if ("ObjectOwner" in owner) return owner.ObjectOwner;
  }
  throw new Error("Not an owned object");
}
