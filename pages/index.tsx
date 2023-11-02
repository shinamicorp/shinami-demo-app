import {
  getSuiExplorerAccountUrl,
  useParsedSuiOwnedObjects,
} from "@/lib/hooks/sui";
import { HERO_MOVE_TYPE, Hero } from "@/lib/shared/hero";
import { AUTH_API_BASE } from "@shinami/nextjs-zklogin";
import { withZkLoginSessionRequired } from "@shinami/nextjs-zklogin/client";
import Link from "next/link";

export default withZkLoginSessionRequired(({ session }) => {
  const { user } = session;
  const { data: heroes, isLoading } = useParsedSuiOwnedObjects(
    user.wallet,
    HERO_MOVE_TYPE,
    Hero
  );

  return (
    <>
      <div>
        <h2>
          {(user.jwtClaims as unknown as { email: string }).email}(
          {user.oidProvider})&apos;s wallet
        </h2>
        <Link
          href={getSuiExplorerAccountUrl(user.wallet, true)}
          target="_blank"
        >
          {user.wallet}
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
                    <Link href={`/heroes/${hero.id.id}`}>{hero.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/heroes/new">New hero</Link>
        </div>
      )}
      <div>
        <Link href={`${AUTH_API_BASE}/logout`}>Sign out</Link>
      </div>
    </>
  );
});
