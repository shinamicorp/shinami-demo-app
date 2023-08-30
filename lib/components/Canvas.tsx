import { Box, Flex, Image } from "@chakra-ui/react";

const Canvas = (props: {
  image: string;
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
    <Flex height="100vh" width="100vw" align="center" justify="center">
      <Box height="1024px" width="1440px" backgroundImage={props.image}>
        <Image
          position="absolute"
          padding="40px"
          src="/shinami-games.svg"
          alt="Shinami games logo"
        />
        <Flex height="100%" width="100%" align="center" justify="center">
          {props.children}
        </Flex>
      </Box>
    </Flex>
  );
};

export default Canvas;