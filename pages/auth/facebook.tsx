import { withFacebookCallback } from "@shinami/nextjs-zklogin/client";

export default withFacebookCallback(({ status }) => {
  switch (status) {
    case "loggingIn":
      return <p>Chugging along...</p>;
    case "error":
      return <p>Something went wrong</p>;
    default:
      return <p>Facebook callback</p>;
  }
});
