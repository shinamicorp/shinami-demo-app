import { withGoogleCallback } from "@shinami/nextjs-zklogin/client";
import { LoginBackground, LoginState } from "./login";
import { Box, Text } from "@chakra-ui/react";

export default withGoogleCallback(({ status }) => {
  return <LoginState status={status} provider={"Google"} />;
});
