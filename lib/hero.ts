import { Infer, object, omit, string } from "superstruct";

export const Hero = object({
  objectId: string(),
  version: string(),
  name: string(),
  imageUrl: string(),
});

export type Hero = Infer<typeof Hero>;

export const MintHero = omit(Hero, ["objectId", "version"]);

export type MintHero = Infer<typeof MintHero>;
