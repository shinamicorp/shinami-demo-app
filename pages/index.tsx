import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

export default function Home() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div>
        <img src={user.picture!} alt={user.name!} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <p>
          <Link href="/wallet">My wallet</Link>
        </p>
        <p>
          <Link href="/api/auth/logout">Logout</Link>
        </p>
      </div>
    );
  } else {
    return (
      <div>
        <h2>Shinami in-app wallet demo</h2>
        <Link href="/api/auth/login">Login</Link>
      </div>
    );
  }
}
