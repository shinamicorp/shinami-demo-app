import {
  Fade,
  Flex,
  Image,
  Link,
  Text,
  Link as ChakraLink,
  Grid,
  Box,
  GridItem,
} from "@chakra-ui/react";
import { ZkLoginUser } from "@shinami/nextjs-zklogin";
import { getSuiExplorerAccountUrl } from "../hooks/sui";
import { SocialIcon } from "./Elements";
import { AuthContext } from "../shared/zklogin";

interface CanvasProps {
  image: string | undefined;
  user?: ZkLoginUser<AuthContext> | undefined;
  hasLogo?: boolean;
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

const Canvas = ({ image, hasLogo = true, user, children }: CanvasProps) => {
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
            {user && (
              <Flex alignItems="center" gap={2}>
                <SocialIcon provider={user?.oidProvider} />
                <Text fontSize="20px">
                  <Link
                    href={getSuiExplorerAccountUrl(user.wallet)}
                    target="_blank"
                  >
                    {user.authContext.email}&apos;s wallet
                  </Link>{" "}
                </Text>
              </Flex>
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
            <Text position="absolute" bottom={6} px={4} textAlign="center">
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
              to learn more.
            </Text>
          </Flex>
        </Flex>

        <Grid
          justifyItems="center"
          templateColumns="repeat(3, 1fr)"
          minWidth="990px"
          p={6}
          gap={4}
        >
          <Box></Box>
          <ChakraLink href="https://sui.io/" target="_blank">
            <Image src="/powered-by-sui.svg" alt="Sui logo" />
          </ChakraLink>

          <Flex width="100%" gap={2} justifyContent="end">
            <ChakraLink
              isExternal
              href="https://www.shinami.com/privacy-policy"
            >
              Privacy policy
            </ChakraLink>
            |
            <ChakraLink isExternal href="https://www.shinami.com/terms">
              Terms
            </ChakraLink>
          </Flex>
        </Grid>
      </Flex>
    </Fade>
  );
};

export default Canvas;
