import { Infer, object, string } from "superstruct";

export const Wallet = object({
  address: string(),
});

export type Wallet = Infer<typeof Wallet>;
