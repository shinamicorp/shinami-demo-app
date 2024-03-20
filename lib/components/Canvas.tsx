/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Fade,
  Flex,
  Image,
  Link,
  Text,
  Link as ChakraLink,
  Button,
} from "@chakra-ui/react";
import { LOGIN_PAGE_PATH, ZkLoginUser } from "@shinami/nextjs-zklogin";
import { getSuiVisionAccountUrl } from "../hooks/sui";
import { SocialIcon } from "./Elements";
import { AuthContext } from "../shared/zklogin";
import { useRouter } from "next/router";

interface CanvasProps {
  image: string | undefined;
  user?: ZkLoginUser<AuthContext> | undefined;
  hasLogo?: boolean;
  showSignIn?: boolean;
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
}

const Canvas = ({
  image,
  hasLogo = true,
  showSignIn = true,
  user,
  children,
}: CanvasProps) => {
  const { asPath } = useRouter();
  return (
    <Fade transition={{ enter: { duration: 2 } }} in>
      <Flex
        flexDir="column"
        alignItems="stretch"
        padding="3rem"
        maxHeight="100vh"
      >
        <Flex
          flexDir="column"
          backgroundImage={image}
          backgroundSize="cover"
          borderRadius="18px"
          boxShadow="0 0 46px 21px #ff430045, inset 0 0 30px #000"
          padding="3rem"
          minHeight="916px"
          position="relative"
          minWidth="990px"
          aspectRatio="16/9"
          maxHeight="100%"
        >
          <Flex width="100%" justify="space-between">
            {hasLogo && (
              <Link href="/">
                <Image src="/shinami-games.svg" alt="Shinami games logo" />
              </Link>
            )}
            {user ? (
              <Flex alignItems="center" gap={2}>
                <SocialIcon provider={user?.oidProvider} />
                <Text fontSize="20px">
                  <Link
                    href={getSuiVisionAccountUrl(user.wallet)}
                    target="_blank"
                  >
                    {user.authContext.email}&apos;s wallet
                  </Link>{" "}
                </Text>
              </Flex>
            ) : (
              showSignIn && (
                <Link
                  href={`${LOGIN_PAGE_PATH}?${new URLSearchParams({
                    redirectTo: asPath,
                  })}`}
                >
                  <Button paddingInlineStart={0} minW="none" variant="ghost">
                    Sign in
                  </Button>
                </Link>
              )
            )}
          </Flex>
          <Flex
            flex={1}
            height="100%"
            width="100%"
            align="center"
            justify="center"
            direction="column"
          >
            {children}
          </Flex>
        </Flex>

        <Flex mt={3} width="100%" gap={2} justifyContent="center">
          <Text textAlign="center">
            This demo is powered by{" "}
            <ChakraLink isExternal href="https://www.shinami.com/">
              Shinami’s
            </ChakraLink>{" "}
            developer platform on Sui. See our{" "}
            <ChakraLink
              isExternal
              href="https://docs.shinami.com/docs/zklogin-game-demo-high-level-guide"
            >
              overview
            </ChakraLink>{" "}
            or{" "}
            <ChakraLink
              isExternal
              href="https://github.com/shinamicorp/shinami-demo-app"
            >
              codebase
            </ChakraLink>{" "}
            to learn more.{" "}
            <ChakraLink
              isExternal
              href="https://www.shinami.com/privacy-policy"
            >
              Privacy policy
            </ChakraLink>{" "}
            |
            <ChakraLink isExternal href="https://www.shinami.com/terms">
              {" "}
              Terms
            </ChakraLink>
          </Text>
        </Flex>
      </Flex>
    </Fade>
  );
};

export default Canvas;
