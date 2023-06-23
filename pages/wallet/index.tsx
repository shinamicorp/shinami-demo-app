import {
  useBurnHero,
  useMintHero,
  useSuiOwnedObjects,
  useWallet,
} from "@/hooks/query";
import { MintHero, PACKAGE_ID } from "@/lib/hero";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import { FormEventHandler, MouseEventHandler, useCallback } from "react";

const SUI_EXPLORER_NETWORK =
  process.env.NEXT_PUBLIC_SUI_EXPLORER_NETWORK ?? "mainnet";

type WalletProps = {
  address: string;
};

function MintHeroForm({ address: owner }: WalletProps) {
  const { mutateAsync: mintHero, isLoading } = useMintHero(owner);

  const handleMint: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const hero: MintHero = {
        name: data.get("name") as string,
        imageUrl: data.get("imageUrl") as string,
      };
      return mintHero(hero);
    },
    [mintHero]
  );

  return (
    <form onSubmit={handleMint}>
      <input type="text" name="name" placeholder="Hero name" />
      <input type="text" name="imageUrl" placeholder="Hero image URL" />
      <button type="submit" disabled={isLoading}>
        Mint hero
      </button>
    </form>
  );
}

function WalletContents({ address }: WalletProps) {
  const { data, error, status, hasNextPage, fetchNextPage } =
    useSuiOwnedObjects(address, {
      filter: {
        MatchAll: [
          {
            StructType: `${PACKAGE_ID}::my_hero::Hero`,
          },
        ],
      },
      options: {
        showType: false,
        showOwner: false,
        showPreviousTransaction: false,
        showDisplay: true,
        showContent: false,
        showBcs: false,
        showStorageRebate: false,
      },
    });

  const { mutateAsync: burnHero, isLoading } = useBurnHero(address);

  const handleBurn: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => burnHero(event.currentTarget.dataset["objectId"]!),
    [burnHero]
  );

  if (status === "loading") return <p>Loading...</p>;
  if (status === "error") return <p>{error.toString()}</p>;

  return (
    <table>
      <tbody>
        {data.pages.flatMap((page) =>
          page.data.map(
            (obj) =>
              obj.data?.display?.data &&
              typeof obj.data.display.data === "object" && (
                <tr key={obj.data.objectId}>
                  <td>
                    <Image
                      src={obj.data.display.data["image_url"]}
                      width={64}
                      height={64}
                      alt="hero image"
                    />
                  </td>
                  <td>{obj.data.display.data["name"]}</td>
                  <td>
                    <Link
                      href={`https://suiexplorer.com/object/${obj.data.objectId}?network=${SUI_EXPLORER_NETWORK}`}
                      target="_blank"
                    >
                      {obj.data.objectId}
                    </Link>
                  </td>
                  <td>
                    <button
                      disabled={isLoading}
                      onClick={handleBurn}
                      data-object-id={obj.data.objectId}
                    >
                      Burn me
                    </button>
                  </td>
                </tr>
              )
          )
        )}
      </tbody>
      <tfoot>
        <tr>
          <td>
            {hasNextPage && (
              <button onClick={() => fetchNextPage()}>Load more</button>
            )}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

export default withPageAuthRequired(({ user }) => {
  const { data: wallet, error, status } = useWallet();

  if (!user.email_verified) return <p>Please verify your email first</p>;
  if (status === "loading") return <p>Loading...</p>;
  if (status === "error") return <p>{error.message}</p>;

  return (
    <div>
      <h2>{user.name}&apos;s wallet</h2>
      <Link
        href={`https://suiexplorer.com/address/${wallet.address}?network=${SUI_EXPLORER_NETWORK}`}
        target="_blank"
      >
        {wallet.address}
      </Link>
      <MintHeroForm address={wallet.address} />
      <WalletContents address={wallet.address} />
    </div>
  );
});
