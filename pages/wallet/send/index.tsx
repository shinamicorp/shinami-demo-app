import {
  useSuiExplorerAddressUrl,
  useSuiExplorerObjectUrl,
} from "@/hooks/explorer";
import { useSendHero } from "@/hooks/query";
import { Wallet } from "@/lib/wallet";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import Error from "next/error";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { FormEventHandler, useCallback } from "react";
import { withWallet } from "..";

function SendForm({
  wallet,
  user,
  hero,
}: {
  wallet: Wallet;
  user: UserProfile;
  hero: string;
}) {
  const walletUrl = useSuiExplorerAddressUrl(wallet.address);
  const heroUrl = useSuiExplorerObjectUrl(hero);
  const router = useRouter();

  const { mutateAsync: send, isLoading } = useSendHero(wallet.address);

  const handleSend: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const recipient = data.get("recipient") as string;
      await send({
        address: hero,
        recipient,
      });
      router.back();
    },
    [hero, router, send]
  );

  return (
    <form onSubmit={handleSend}>
      <p>
        Send hero{" "}
        <Link href={heroUrl} target="_blank">
          {hero}
        </Link>
      </p>
      <p>
        from {user.name}&apos;s wallet{" "}
        <Link href={walletUrl} target="_blank">
          {wallet.address}
        </Link>
      </p>
      <p>
        to <input name="recipient" placeholder="Recipient address" />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </p>
    </form>
  );
}

export default withWallet(({ wallet, user }) => {
  const params = useSearchParams();
  const hero = params.get("hero");

  if (!hero) return <Error statusCode={404} />;

  return <SendForm wallet={wallet} user={user} hero={hero} />;
});
