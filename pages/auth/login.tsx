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

export default withNewZkLoginSession(
  () => relativeToCurrentEpoch(sui),
  ({ session }) => {
    const router = useRouter();
    const redirectTo = first(router.query.redirectTo);
    const callbackBaseUrl = new URL("auth/", window.location.origin);
    console.log(router.query.redirectTo);
    return (
      <LoginBackground>
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
      </LoginBackground>
    );
  }
);

export const LoginBackground = (props: {
  children:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | Iterable<React.ReactNode>
    | React.ReactPortal
    | React.PromiseLikeOfReactNode
    | null
    | undefined;
}) => {
  return (
    <Flex
      height="100vh"
      width="100vw"
      align="center"
      justify="center"
      backgroundColor="black"
    >
      <Fade transition={{ enter: { duration: 2 } }} in>
        <Box
          height="924px"
          width="1360px"
          position="relative"
          backgroundImage={"/login-bg.jpg"}
          backgroundSize="cover"
          borderRadius="18px"
          boxShadow="0 0 46px 21px #ff430045, inset 0 0 30px #000 "
        >
          <Flex
            height="100%"
            width="100%"
            align="center"
            justify="center"
            direction="column"
          >
            {props.children}
          </Flex>
        </Box>
      </Fade>
    </Flex>
  );
};

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
        <LoginBackground>
          <Box p="20px" opacity="0.5">
            <Image src="/spinner.svg" alt="spinner" />
            <Text fontSize="30px">Chugging along...</Text>
          </Box>
        </LoginBackground>
      );
    case "error":
      return (
        <LoginBackground>
          <Text fontSize="30px">Something went wrong</Text>
        </LoginBackground>
      );
    default:
      return (
        <LoginBackground>
          <Text fontSize="30px">{provider} callback</Text>
        </LoginBackground>
      );
  }
};

export const ZkLoginLoading = () => {
  return (
    <LoginBackground>
      <Text fontSize="30px">ZkLogin Loading...</Text>
    </LoginBackground>
  );
};

export const ZkLoginRedirecting = () => {
  return (
    <LoginBackground>
      <Text fontSize="30px">ZkLogin redirecting...</Text>
    </LoginBackground>
  );
};
