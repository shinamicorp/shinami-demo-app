/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { withGoogleCallback } from "@shinami/nextjs-zklogin/client";
import { LoginState } from "./login";

export default withGoogleCallback(({ status }) => {
  return <LoginState status={status} provider={"Google"} />;
});
