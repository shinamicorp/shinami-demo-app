import { Box, Fade, Flex, Image } from "@chakra-ui/react";

const Canvas = (props: {
  image: string | undefined;
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
      {props.image && (
        <Fade transition={{ enter: { duration: 2 } }} in>
          <Box
            height="924px"
            width="1360px"
            backgroundImage={props.image}
            backgroundSize="cover"
            borderRadius="18px"
            boxShadow="0 0 46px 21px #ff430045, inset 0 0 30px #000 "
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
      )}
    </Flex>
  );
};

export default Canvas;
