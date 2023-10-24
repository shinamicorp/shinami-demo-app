import { sui } from "@/lib/api/shinami";
import {
  FACEBOOK_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  TWITCH_CLIENT_ID,
} from "@/lib/shared/zklogin";
import { ZkLoginUserId } from "@shinami/nextjs-zklogin";
import { SaltProvider, ZkProofProvider } from "@shinami/nextjs-zklogin/server";
import { authHandler } from "@shinami/nextjs-zklogin/server/pages";

const ZKLOGIN_PROVER_URL = "http://10.10.1.34:8080/v1";

// TODO - Switch to Shinami salt backend
const saltProvider: SaltProvider = () => BigInt(100);

// TODO - Switch to Shinami prover
const zkProofProvider: ZkProofProvider = async ({
  jwt,
  publicKey,
  maxEpoch,
  randomness,
  salt,
  keyClaimName,
}) => {
  const resp = await fetch(ZKLOGIN_PROVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      jwt,
      extendedEphemeralPublicKey: publicKey,
      maxEpoch: maxEpoch.toString(),
      jwtRandomness: randomness,
      salt: salt.toString(),
      keyClaimName,
    }),
  });
  if (!resp.ok) {
    throw new Error(`Prover response status: ${resp.status}`);
  }

  // No validation on the proof response
  return await resp.json();
};

function allowUser(user: ZkLoginUserId): boolean {
  return (
    user.aud === GOOGLE_CLIENT_ID ||
    user.aud === FACEBOOK_CLIENT_ID ||
    user.aud === TWITCH_CLIENT_ID
  );
}

export default authHandler(
  sui,
  saltProvider,
  zkProofProvider,
  undefined,
  allowUser
);
