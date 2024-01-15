import { sui, zkp, zkw } from "@/lib/api/shinami";
import {
  AuthContext,
  FACEBOOK_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  TWITCH_CLIENT_ID,
} from "@/lib/shared/zklogin";
import { Client, HTTPTransport, RequestManager } from "@open-rpc/client-js";
import { JwtClaims, OidProvider, ZkLoginUserId } from "@shinami/nextjs-zklogin";
import { authHandler } from "@shinami/nextjs-zklogin/server/pages";

const USER_RPC_URL = process.env.USER_RPC_URL;
const allowAllUsers = USER_RPC_URL === "ALLOW_ALL";
const userRpc =
  USER_RPC_URL && !allowAllUsers
    ? new Client(new RequestManager([new HTTPTransport(USER_RPC_URL)]))
    : undefined;

async function authorizeUser(
  provider: OidProvider,
  user: ZkLoginUserId,
  jwtClaims: JwtClaims
): Promise<AuthContext | undefined> {
  const { email, email_verified } = jwtClaims;

  // Facebook JWT doesn't include email_verified for some reason.
  if (!email || (provider !== "facebook" && !email_verified)) return undefined;

  if (!allowAllUsers) {
    if (!userRpc) {
      console.warn(
        "Disallow user sign in because USER_RPC_URL env isn't configured. " +
          "To allow all users, set it to ALLOW_ALL."
      );
      return undefined;
    }

    const isActive = await userRpc.request({
      method: "isActiveUser",
      params: [email],
    });
    if (!isActive) {
      console.debug("Unauthorized %s user %s", provider, email);
      return undefined;
    }
  }

  console.debug("Authorized %s user %s", provider, email);
  return {
    email: email as string,
  };
}

export default authHandler(
  sui,
  zkw,
  zkp,
  {
    google: GOOGLE_CLIENT_ID ? [GOOGLE_CLIENT_ID] : undefined,
    facebook: FACEBOOK_CLIENT_ID ? [FACEBOOK_CLIENT_ID] : undefined,
    twitch: TWITCH_CLIENT_ID ? [TWITCH_CLIENT_ID] : undefined,
  },
  authorizeUser
);
