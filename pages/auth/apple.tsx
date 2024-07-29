/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { withAppleCallback } from "@shinami/nextjs-zklogin/client";
import { LoginState } from "./login";

export default withAppleCallback(({ status }) => {
  return <LoginState status={status} provider="apple" />;
});
