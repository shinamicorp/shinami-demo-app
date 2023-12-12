import { ZkLoginSessionProvider } from "@shinami/nextjs-zklogin/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { Irish_Grover, Metal_Mania } from "next/font/google";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Head from "next/head";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@/lib/components/theme";

const queryClient = new QueryClient();
const irishGrover = Irish_Grover({ weight: "400", subsets: ["latin"] });
const metalMania = Metal_Mania({ weight: "400", subsets: ["latin"] });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon_32.png" />
      </Head>
      <style jsx global>
        {`
          :root {
            --font-irishGrover: ${irishGrover.style.fontFamily};
            --font-metalMania: ${metalMania.style.fontFamily};
          }
        `}
      </style>
      <QueryClientProvider client={queryClient}>
        <ZkLoginSessionProvider>
          <ChakraProvider theme={theme}>
            <Component {...pageProps} />
          </ChakraProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </ZkLoginSessionProvider>
      </QueryClientProvider>
    </>
  );
}
