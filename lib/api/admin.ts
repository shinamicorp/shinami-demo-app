import { Mutex } from "async-mutex";
import { throwExpression } from "../shared/error";

const ADMIN_CAP =
  process.env.ADMIN_CAP ??
  throwExpression(new Error("ADMIN_CAP not configured"));

const adminCapLock = new Mutex();

export async function runWithAdminCap<T>(
  func: (cap: string) => Promise<T>
): Promise<T> {
  // [IMPORTANT]
  // Prevent concurrent access to admin cap to avoid equivocation.
  // This also means ADMIN_CAP must not be shared when deploying the backend to multiple replicas.
  return adminCapLock.runExclusive(() => func(ADMIN_CAP));
}
