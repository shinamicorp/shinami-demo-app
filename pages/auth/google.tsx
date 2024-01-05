import { withGoogleCallback } from "@shinami/nextjs-zklogin/client";
import { LoginState } from "./login";

export default withGoogleCallback(({ status }) => {
  return <LoginState status={status} provider={"Google"} />;
});
