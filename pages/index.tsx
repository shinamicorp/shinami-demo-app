import { withUserWallet } from "@/lib/components/auth";
import {
  getSuiExplorerAddressUrl,
  useParsedSuiOwnedObjects,
} from "@/lib/hooks/sui";
import { HERO_MOVE_TYPE, Hero } from "@/lib/shared/hero";
import Link from "next/link";

export default withUserWallet(({ user, wallet }) => {
  const { data: heroes, isLoading } = useParsedSuiOwnedObjects(
    wallet.address,
    HERO_MOVE_TYPE,
    Hero
  );

  return (
    <>
      <div>
        <h2>{user.name}&apos;s wallet</h2>
        <Link href={getSuiExplorerAddressUrl(wallet.address)} target="_blank">
          {wallet.address}
        </Link>
      </div>
      {isLoading && <div>Loading heroes...</div>}
      {!isLoading && !heroes && <div>Failed to load heroes</div>}
      {!isLoading && heroes && (
        <div>
          {heroes.length === 0 && <h3>No heroes yet</h3>}
          {heroes.length > 0 && (
            <div>
              <h3>My heroes</h3>
              <ul>
                {heroes.map((hero) => (
                  <li key={hero.id.id}>
                    <Link href={`/heroes/${hero.id.id}}`}>{hero.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/heroes/new">New hero</Link>
        </div>
      )}
      <div>
        <Link href="/api/auth/logout">
          Sign out
        </Link>
      </div>
    </>
  );
});
