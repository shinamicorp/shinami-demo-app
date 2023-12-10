import { sui } from "@/lib/hooks/sui";
import { first } from "@/lib/shared/utils";
import {
  FACEBOOK_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  TWITCH_CLIENT_ID,
} from "@/lib/shared/zklogin";
import {
  getFacebookAuthUrl,
  getGoogleAuthUrl,
  getTwitchAuthUrl,
  relativeToCurrentEpoch,
  withNewZkLoginSession,
} from "@shinami/nextjs-zklogin/client";
import { useRouter } from "next/router";

export default withNewZkLoginSession(
  () => relativeToCurrentEpoch(sui),
  ({ session }) => {
    const router = useRouter();
    const redirectTo = first(router.query.redirectTo);
    const callbackBaseUrl = new URL("auth/", window.location.origin);

    return (
      <>
        {GOOGLE_CLIENT_ID && (
          <div>
            <button
              onClick={() => {
                router.replace(
                  getGoogleAuthUrl(
                    session,
                    GOOGLE_CLIENT_ID!,
                    new URL("google", callbackBaseUrl),
                    redirectTo,
                    ["email"] // optionally include email in JWT claims
                  )
                );
              }}
            >
              Sign in with Google
            </button>
          </div>
        )}
        {FACEBOOK_CLIENT_ID && (
          <div>
            <button
              onClick={() => {
                router.replace(
                  getFacebookAuthUrl(
                    session,
                    FACEBOOK_CLIENT_ID!,
                    new URL("facebook", callbackBaseUrl),
                    redirectTo,
                    ["email"] // optionally include email in JWT claims
                  )
                );
              }}
            >
              Sign in with Facebook
            </button>
          </div>
        )}
        {TWITCH_CLIENT_ID && (
          <div>
            <button
              onClick={() => {
                router.replace(
                  getTwitchAuthUrl(
                    session,
                    TWITCH_CLIENT_ID!,
                    new URL("twitch", callbackBaseUrl),
                    redirectTo,
                    ["user:read:email"], // optionally include email in JWT claims
                    ["email", "email_verified"]
                  )
                );
              }}
            >
              Sign in with Twitch
            </button>
          </div>
        )}
      </>
    );
  }
);
