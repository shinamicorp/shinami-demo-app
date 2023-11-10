import { sui, zkp, zkw } from "@/lib/api/shinami";
import {
  FACEBOOK_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  TWITCH_CLIENT_ID,
} from "@/lib/shared/zklogin";
import { authHandler } from "@shinami/nextjs-zklogin/server/pages";

export default authHandler(sui, zkw, zkp, {
  google: GOOGLE_CLIENT_ID ? [GOOGLE_CLIENT_ID] : undefined,
  facebook: FACEBOOK_CLIENT_ID ? [FACEBOOK_CLIENT_ID] : undefined,
  twitch: TWITCH_CLIENT_ID ? [TWITCH_CLIENT_ID] : undefined,
});
