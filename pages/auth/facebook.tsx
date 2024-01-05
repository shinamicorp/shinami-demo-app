import { withFacebookCallback } from "@shinami/nextjs-zklogin/client";
import { LoginState } from "./login";

export default withFacebookCallback(({ status }) => {
  return <LoginState status={status} provider={"Facebook"} />;
});
