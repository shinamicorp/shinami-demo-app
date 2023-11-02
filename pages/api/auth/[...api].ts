import { sui, zkp } from "@/lib/api/shinami";
import {
  FACEBOOK_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  TWITCH_CLIENT_ID,
} from "@/lib/shared/zklogin";
import { ZkLoginUserId } from "@shinami/nextjs-zklogin";
import { SaltProvider } from "@shinami/nextjs-zklogin/server";
import { authHandler } from "@shinami/nextjs-zklogin/server/pages";

// TODO - Switch to Shinami zkWallet client once available.
const saltProvider: SaltProvider = () => BigInt(100);

function allowUser(user: ZkLoginUserId): boolean {
  return (
    user.aud === GOOGLE_CLIENT_ID ||
    user.aud === FACEBOOK_CLIENT_ID ||
    user.aud === TWITCH_CLIENT_ID
  );
}

export default authHandler(sui, saltProvider, zkp, undefined, allowUser);
