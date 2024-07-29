/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import Canvas from "@/lib/components/Canvas";
import { Divider, SocialIcon } from "@/lib/components/Elements";
import { sui } from "@/lib/hooks/sui";
import { first } from "@/lib/shared/utils";
import {
  APPLE_CLIENT_ID,
  FACEBOOK_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  TWITCH_CLIENT_ID,
} from "@/lib/shared/zklogin";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { OidProvider } from "@shinami/nextjs-zklogin";
import {
  CallbackStatus,
  getAppleAuthUrl,
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

    return (
      <Canvas image="/login-bg.jpg" hasLogo={false} showSignIn={false}>
        <Flex
          height="100%"
          width="100%"
          align="center"
          justify="center"
          gap="200px"
        >
          <VStack gap={6}>
            <Heading size="2xl">Sign in</Heading>
            <Divider />
            {GOOGLE_CLIENT_ID && (
              <Button
                fontFamily="sans-serif"
                variant="signIn"
                leftIcon={<SocialIcon provider="google" />}
                color="black"
                bg="white"
                borderColor="black"
                onClick={() => {
                  router.replace(
                    getGoogleAuthUrl(
                      session,
                      GOOGLE_CLIENT_ID!,
                      "google",
                      redirectTo,
                      ["email"], // optionally include email in JWT claims
                      ["select_account"],
                    ),
                  );
                }}
              >
                Sign in with Google
              </Button>
            )}
            {FACEBOOK_CLIENT_ID && (
              <Button
                fontFamily="sans-serif"
                variant="signIn"
                leftIcon={<SocialIcon provider="facebook" />}
                color="white"
                bg="#0866FF"
                onClick={() => {
                  router.replace(
                    getFacebookAuthUrl(
                      session,
                      FACEBOOK_CLIENT_ID!,
                      "facebook",
                      redirectTo,
                      ["email"], // optionally include email in JWT claims
                    ),
                  );
                }}
              >
                Sign in with Facebook
              </Button>
            )}
            {TWITCH_CLIENT_ID && (
              <Button
                fontFamily="sans-serif"
                variant="signIn"
                leftIcon={<SocialIcon provider="twitch" />}
                color="white"
                bg="#6441A5"
                onClick={() => {
                  router.replace(
                    getTwitchAuthUrl(
                      session,
                      TWITCH_CLIENT_ID!,
                      "twitch",
                      redirectTo,
                      ["user:read:email"], // optionally include email in JWT claims
                      ["email", "email_verified"],
                    ),
                  );
                }}
              >
                Sign in with Twitch
              </Button>
            )}
            {APPLE_CLIENT_ID && (
              <Button
                fontFamily="sans-serif"
                variant="signIn"
                leftIcon={<SocialIcon provider="apple" />}
                color="white"
                bg="black"
                onClick={() => {
                  router.replace(
                    getAppleAuthUrl(
                      session,
                      APPLE_CLIENT_ID!,
                      "apple",
                      redirectTo,
                      ["email"],
                    ),
                  );
                }}
              >
                Sign in with Apple
              </Button>
            )}
            <Text>* Log in requires an email tied to a Shinami account.</Text>
          </VStack>

          <Link href="/">
            <Image
              width="400px"
              src="/shinami-games.svg"
              alt="Shinami games logo"
            />
          </Link>
        </Flex>
      </Canvas>
    );
  },
  () => <ZkLoginLoading />,
);

export const LoginState = ({
  status,
  provider,
}: {
  status: CallbackStatus;
  provider: OidProvider;
}) => {
  switch (status) {
    case "loggingIn":
      return (
        <Canvas image="/login-bg.jpg" showSignIn={false}>
          <Box p="20px" opacity="0.5">
            <Image src="/spinner.svg" alt="spinner" />
            <Text fontSize="30px">Chugging along...</Text>
          </Box>
        </Canvas>
      );
    case "error":
      return (
        <Canvas image="/login-bg.jpg">
          <Text fontSize="30px">
            Log in requires an email tied to a Shinami account.
          </Text>
          <Link href="/">
            <Button paddingInlineStart={0} minW="none" variant="ghost">
              Go home
            </Button>
          </Link>
        </Canvas>
      );
    default:
      return (
        <Canvas image="/login-bg.jpg">
          <Text fontSize="30px">{provider} callback</Text>
        </Canvas>
      );
  }
};

export const ZkLoginLoading = () => {
  return (
    <Canvas image="/login-bg.jpg" showSignIn={false}>
      <Text fontSize="30px">Initializing...</Text>
    </Canvas>
  );
};

export const ZkLoginRedirecting = () => {
  return (
    <Canvas image="/login-bg.jpg" showSignIn={false}>
      <Text fontSize="30px">ZkLogin redirecting...</Text>
    </Canvas>
  );
};
