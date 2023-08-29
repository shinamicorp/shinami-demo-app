import { theme } from "@/lib/components/theme";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { Irish_Grover } from "next/font/google";

const queryClient = new QueryClient();
const irishGrover = Irish_Grover({ weight: "400", subsets: ["latin"] });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <style jsx global>
        {`
          :root {
            --font-irishGrover: ${irishGrover.style.fontFamily};
          }
        `}
      </style>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </QueryClientProvider>
    </UserProvider>
  );
}
