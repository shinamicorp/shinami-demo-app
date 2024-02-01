"use client"; // Error components must be Client Components

import Canvas from "@/lib/components/Canvas";
import { Button, Link, Text } from "@chakra-ui/react";
import { useEffect } from "react";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Canvas image="/login-bg.jpg">
      <Text fontSize="30px">Something went wrong!</Text>
      <Link href="/">
        <Button paddingInlineStart={0} minW="none" variant="ghost">
          Go home
        </Button>
      </Link>
    </Canvas>
  );
}
