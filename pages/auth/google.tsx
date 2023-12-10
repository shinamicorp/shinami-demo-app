import { withGoogleCallback } from "@shinami/nextjs-zklogin/client";

export default withGoogleCallback(({ status }) => {
  switch (status) {
    case "loggingIn":
      return <p>Chugging along...</p>;
    case "error":
      return <p>Something went wrong</p>;
    default:
      return <p>Google callback</p>;
  }
});
