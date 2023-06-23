import {
  useSuiExplorerAddressUrl,
  useSuiExplorerObjectUrl,
} from "@/hooks/explorer";
import {
  useBurnHero,
  useMintHero,
  useSuiOwnedObjects,
  useWallet,
} from "@/hooks/query";
import { MintHero, PACKAGE_ID } from "@/lib/hero";
import { Wallet } from "@/lib/wallet";
import { UserProfile, withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { SuiObjectData } from "@mysten/sui.js";
import Image from "next/image";
import Link from "next/link";
import {
  FormEventHandler,
  FunctionComponent,
  MouseEventHandler,
  useCallback,
} from "react";

export type WalletProps = {
  wallet: Wallet;
  user: UserProfile;
};

function MintHeroForm({ wallet }: WalletProps) {
  const { mutateAsync: mintHero, isLoading } = useMintHero(wallet.address);

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

function WalletItem({
  wallet,
  item: { objectId, display },
}: {
  wallet: Wallet;
  item: SuiObjectData;
}) {
  const { mutateAsync: burnHero, isLoading } = useBurnHero(wallet.address);
  const objectUrl = useSuiExplorerObjectUrl(objectId);

  const handleBurn: MouseEventHandler<HTMLButtonElement> = useCallback(
    () => burnHero(objectId),
    [burnHero, objectId]
  );

  if (typeof display?.data !== "object" || !display.data) return <></>;
  return (
    <tr>
      <td>
        <Image
          src={display.data["image_url"]}
          width={64}
          height={64}
          alt="hero image"
        />
      </td>
      <td>{display.data["name"]}</td>
      <td>
        <Link href={objectUrl} target="_blank">
          {objectId}
        </Link>
      </td>
      <td>
        <button disabled={isLoading} onClick={handleBurn}>
          Burn me
        </button>
      </td>
      <td>
        <Link href={`/wallet/send?hero=${objectId}`}>
          <button>Send me</button>
        </Link>
      </td>
    </tr>
  );
}

function WalletContents({ wallet }: WalletProps) {
  const { data, error, status, hasNextPage, fetchNextPage } =
    useSuiOwnedObjects(wallet.address, {
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

  if (status === "loading") return <p>Loading...</p>;
  if (status === "error") return <p>{error.toString()}</p>;

  return (
    <table>
      <tbody>
        {data.pages.flatMap((page) =>
          page.data.map(
            (obj) =>
              obj.data && (
                <WalletItem
                  wallet={wallet}
                  item={obj.data}
                  key={obj.data.objectId}
                />
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

export const withWallet = (Component: FunctionComponent<WalletProps>) =>
  withPageAuthRequired(({ user }) => {
    const { data: wallet, error, status } = useWallet();

    if (!user.email_verified) return <p>Please verify your email first</p>;
    if (status === "loading") return <p>Loading...</p>;
    if (status === "error") return <p>{error.message}</p>;

    return <Component wallet={wallet} user={user} />;
  });

export default withWallet(({ wallet, user }) => {
  const walletUrl = useSuiExplorerAddressUrl(wallet.address);

  return (
    <div>
      <h2>{user.name}&apos;s wallet</h2>
      <Link href={walletUrl} target="_blank">
        {wallet.address}
      </Link>
      <MintHeroForm wallet={wallet} user={user} />
      <WalletContents wallet={wallet} user={user} />
    </div>
  );
});
