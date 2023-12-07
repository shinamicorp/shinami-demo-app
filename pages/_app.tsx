import { ZkLoginSessionProvider } from "@shinami/nextjs-zklogin/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ZkLoginSessionProvider>
        <Component {...pageProps} />
      </ZkLoginSessionProvider>
    </QueryClientProvider>
  );
}
