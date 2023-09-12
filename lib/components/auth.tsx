import { UserProfile, withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { FunctionComponent } from "react";
import { useWallet } from "../hooks/api";
import { Wallet } from "../shared/wallet";
import { Box, Heading, VStack } from "@chakra-ui/react";

/**
 * A higher-order component to require the user to be signed in with a verified email.
 *
 * The verified email is important, as we associate the user with their Shinami wallet using email
 * address (possibly from multiple sign-in methods) in this demo. In your app, this association
 * logic can be different.
 */
export const withVerifiedEmailRequired = (
  Component: FunctionComponent<{ user: UserProfile }>
) =>
  withPageAuthRequired(({ user }) => {
    if (!user.email_verified) return <p>Please verify your email first</p>;
    return <Component user={user} />;
  });

export type UserWalletProps = {
  user: UserProfile;
  wallet: Wallet;
};

/**
 * A higher-order component to supply the user's Shinami wallet info.
 */
export const withUserWallet = (Component: FunctionComponent<UserWalletProps>) =>
  withVerifiedEmailRequired(({ user }) => {
    const { data: wallet, error, isLoading, isError } = useWallet();
    if (isLoading)
      return (
        <VStack justify="center" w="100vw" h="100vh" background="black">
          <Heading color="gray.700" size="sm">
            Loading user wallet...
          </Heading>
        </VStack>
      );
    if (isError) return <p>{error.message}</p>;

    return <Component wallet={wallet} user={user} />;
  });
