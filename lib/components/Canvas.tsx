import { Box, Fade, Flex, Image, Link, Text, VStack } from "@chakra-ui/react";
import { ZkLoginUser } from "@shinami/nextjs-zklogin";
import { getSuiExplorerAccountUrl } from "../hooks/sui";

const Canvas = (props: {
  image: string | undefined;
  user?: ZkLoginUser | undefined;
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
    <Fade transition={{ enter: { duration: 2 } }} in>
      <Flex flexDir="column" padding="3rem">
        <Flex
          flexDir="column"
          backgroundImage={props.image}
          backgroundSize="cover"
          borderRadius="18px"
          boxShadow="0 0 46px 21px #ff430045, inset 0 0 30px #000"
          padding="3rem"
          minHeight="916px"
          position="relative"
          minWidth="990px"
        >
          <Flex width="100%" justify="space-between">
            <Image src="/shinami-games.svg" alt="Shinami games logo" />
            {props.user && (
              <Text fontSize="20px">
                <Link
                  href={getSuiExplorerAccountUrl(props.user.wallet)}
                  target="_blank"
                >
                  {props.user?.jwtClaims.email as string}&apos;s wallet
                </Link>{" "}
                ({props.user?.oidProvider})
              </Text>
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
            {props.children}
          </Flex>
        </Flex>

        <Flex minWidth="990px" justify="center" p={6}>
          <Link href="https://sui.io/" target="_blank">
            <Image src="/powered-by-sui.svg" alt="Sui logo" />
          </Link>
        </Flex>
      </Flex>
    </Fade>
  );
};

export default Canvas;
