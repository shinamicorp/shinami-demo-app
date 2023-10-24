import {
  Infer,
  integer,
  max,
  min,
  object,
  size,
  string,
  type,
} from "superstruct";
import { ObjectId } from "./sui";
import { throwExpression } from "./utils";

export const PACKAGE_ID =
  process.env.NEXT_PUBLIC_PACKAGE_ID ??
  throwExpression(new Error("NEXT_PUBLIC_PACKAGE_ID not configured"));

export const MINT_TICKET_MOVE_TYPE = `${PACKAGE_ID}::hero::MintTicket`;
export const HERO_MOVE_TYPE = `${PACKAGE_ID}::hero::Hero`;
export const LEVEL_UP_TICKET_MOVE_TYPE = `${PACKAGE_ID}::hero::LevelUpTicket`;

export const Character = max(min(integer(), 0), 2);
export type Character = Infer<typeof Character>;

export const MintTicketRequest = object({
  character: Character,
});
export type MintTicketRequest = Infer<typeof MintTicketRequest>;

export const MintTicket = object({
  id: ObjectId,
  character: Character,
  level: integer(),
  attribute_points: integer(),
});
export type MintTicket = Infer<typeof MintTicket>;
export const WithMintTicket = type(MintTicket.schema);
export type WithMintTicket = MintTicket;

export const HeroName = size(string(), 1, 128);
export type HeroName = Infer<typeof HeroName>;

export const MintHeroRequest = object({
  ticketId: string(),
  name: HeroName,
  damage: integer(),
  speed: integer(),
  defense: integer(),
});
export type MintHeroRequest = Infer<typeof MintHeroRequest>;

export const Hero = object({
  id: ObjectId,
  character: Character,
  name: HeroName,
  level: integer(),
  damage: integer(),
  speed: integer(),
  defense: integer(),
});
export type Hero = Infer<typeof Hero>;
export const WithHero = type(Hero.schema);
export type WithHero = Hero;

export const LevelUpTicket = object({
  id: ObjectId,
  hero_id: string(),
  attribute_points: integer(),
});
export type LevelUpTicket = Infer<typeof LevelUpTicket>;
export const WithLevelUpTicket = type(LevelUpTicket.schema);
export type WithLevelUpTicket = LevelUpTicket;

export const LevelUpRequest = object({
  ticketId: string(),
  damage: integer(),
  speed: integer(),
  defense: integer(),
});
export type LevelUpRequest = Infer<typeof LevelUpRequest>;

export const UpdateHeroRequest = object({
  name: HeroName,
});
export type UpdateHeroRequest = Infer<typeof UpdateHeroRequest>;
