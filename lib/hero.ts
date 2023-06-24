import { Infer, object, omit, string } from "superstruct";
import { throwExpression } from "./error";

export const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ??
  throwExpression(new Error("NEXT_PUBLIC_PACKAGE_ID not configured"));

export const Hero = object({
  objectId: string(),
  version: string(),
  name: string(),
  imageUrl: string(),
});
export type Hero = Infer<typeof Hero>;

export const MintHero = omit(Hero, ["objectId", "version"]);
export type MintHero = Infer<typeof MintHero>;

export const SendHero = object({
  recipient: string(),
});
export type SendHero = Infer<typeof SendHero>;
