import { withTwitchCallback } from "@shinami/nextjs-zklogin/client";

export default withTwitchCallback(({ status }) => {
  switch (status) {
    case "loggingIn":
      return <p>Chugging along...</p>;
    case "error":
      return <p>Something went wrong</p>;
    default:
      return <p>Twitch callback</p>;
  }
});
