import { withTwitchCallback } from "@shinami/nextjs-zklogin/client";
import { LoginState } from "./login";

export default withTwitchCallback(({ status }) => {
  return <LoginState status={status} provider={"Twitch"} />;
});
