import { Box, Fade, Flex, Image } from "@chakra-ui/react";

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
    <Flex
      height="100vh"
      width="100vw"
      align="center"
      justify="center"
      backgroundColor="black"
    >
      <Fade transition={{ enter: { duration: 2 } }} in>
        <Box
          height="1024px"
          width="1460px"
          backgroundImage={props.image}
          backgroundSize="cover"
        >
          <Image
            position="absolute"
            padding="40px"
            src="/shinami-games.svg"
            alt="Shinami games logo"
          />
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

export default Canvas;
