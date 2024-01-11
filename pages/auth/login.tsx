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
import {
  Box,
  Button,
  Fade,
  Flex,
  Heading,
  Image,
  VStack,
  Text,
} from "@chakra-ui/react";
import { Divider } from "@/lib/components/Elements";
import Canvas from "@/lib/components/Canvas";

export default withNewZkLoginSession(
  () => relativeToCurrentEpoch(sui),
  ({ session }) => {
    const router = useRouter();
    const redirectTo = first(router.query.redirectTo);
    const callbackBaseUrl = new URL("auth/", window.location.origin);
    return (
      <Canvas image="/login-bg.jpg">
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
                leftIcon={<Image src="/google.svg" alt="Google icon" />}
                color="black"
                bg="white"
                borderColor="black"
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
              </Button>
            )}
            {FACEBOOK_CLIENT_ID && (
              <Button
                fontFamily="sans-serif"
                variant="signIn"
                leftIcon={<Image src="/facebook.svg" alt="Facebook icon" />}
                color="white"
                bg="#0866FF"
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
              </Button>
            )}
            {TWITCH_CLIENT_ID && (
              <Button
                fontFamily="sans-serif"
                variant="signIn"
                leftIcon={<Image src="/twitch.svg" alt="Twitch icon" />}
                color="white"
                bg="#6441A5"
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
              </Button>
            )}
          </VStack>
          <Image
            width="400px"
            src="/shinami-games.svg"
            alt="Shinami games logo"
          />
        </Flex>
      </Canvas>
    );
  },
  () => <ZkLoginLoading />
);

export const LoginState = ({
  status,
  provider,
}: {
  status: string;
  provider: string;
}) => {
  switch (status) {
    case "loggingIn":
      return (
        <Canvas image="/login-bg.jpg">
          <Box p="20px" opacity="0.5">
            <Image src="/spinner.svg" alt="spinner" />
            <Text fontSize="30px">Chugging along...</Text>
          </Box>
        </Canvas>
      );
    case "error":
      return (
        <Canvas image="/login-bg.jpg">
          <Text fontSize="30px">Something went wrong</Text>
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
    <Canvas image="/login-bg.jpg">
      <Text fontSize="30px">ZkLogin Loading...</Text>
    </Canvas>
  );
};

export const ZkLoginRedirecting = () => {
  return (
    <Canvas image="/login-bg.jpg">
      <Text fontSize="30px">ZkLogin redirecting...</Text>
    </Canvas>
  );
};
