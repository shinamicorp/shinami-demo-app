/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { withFacebookCallback } from "@shinami/nextjs-zklogin/client";
import { LoginState } from "./login";

export default withFacebookCallback(({ status }) => {
  return <LoginState status={status} provider={"Facebook"} />;
});
