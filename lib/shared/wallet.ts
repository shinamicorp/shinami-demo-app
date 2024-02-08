/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Infer, object, string } from "superstruct";

export const Wallet = object({
  address: string(),
});
export type Wallet = Infer<typeof Wallet>;
