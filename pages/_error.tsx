import Canvas from "@/lib/components/Canvas";
import { Button, Link, Text } from "@chakra-ui/react";
import { NextPage, NextPageContext } from "next";

interface Props {
  statusCode?: number;
}

const Error: NextPage<Props> = ({ statusCode }) => {
  return (
    <Canvas image="/login-bg.jpg">
      <Text fontSize="30px">Something went wrong!</Text>
      <Text>
        {statusCode
          ? `An error ${statusCode} occurred on the server`
          : "An error occurred on client"}
      </Text>
      <Link href="/">
        <Button paddingInlineStart={0} minW="none" variant="ghost">
          Go home
        </Button>
      </Link>
    </Canvas>
  );
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
