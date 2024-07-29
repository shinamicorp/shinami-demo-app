/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { withTwitchCallback } from "@shinami/nextjs-zklogin/client";
import { LoginState } from "./login";

export default withTwitchCallback(({ status }) => {
  return <LoginState status={status} provider="twitch" />;
});
