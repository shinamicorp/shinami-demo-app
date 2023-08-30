import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextApiHandler } from "next";
import { ApiErrorBody } from "../shared/error";

export function withMethodHandlers<
  G = unknown,
  P = unknown,
  U = unknown,
  D = unknown
>({
  get,
  post,
  patch,
  del,
}: {
  get?: NextApiHandler<G>;
  post?: NextApiHandler<P>;
  patch?: NextApiHandler<U>;
  del?: NextApiHandler<D>;
}): NextApiHandler<G | P | U | D | ApiErrorBody> {
  return async (req, res) => {
    let handler: NextApiHandler<G | P | U | D> | undefined;
    switch (req.method) {
      case "GET":
        handler = get;
        break;
      case "POST":
        handler = post;
        break;
      case "PATCH":
        handler = patch;
        break;
      case "DELETE":
        handler = del;
        break;
    }

    if (!handler) return res.status(405).json({ error: "Bad method" });

    try {
      return await handler(req, res);
    } catch (e) {
      console.error("Unhandled error", e);
      return res.status(500).json({ error: "Internal error" });
    }
  };
}

export function withVerifiedEmailRequired<T>(
  handler: NextApiHandler<T>
): NextApiHandler<T> {
  return withApiAuthRequired(async (req, res) => {
    const { user } = (await getSession(req, res))!;
    if (!user.email_verified) {
      return res.status(401).json({ error: "Email not verified" });
    }
    return handler(req, res);
  });
}
