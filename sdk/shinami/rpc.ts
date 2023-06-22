import {
  Client,
  HTTPTransport,
  JSONRPCError,
  RequestManager,
} from "@open-rpc/client-js";
import { Infer, Struct, create, object, string, validate } from "superstruct";

export class ShinamiRpcClient {
  client: Client;

  constructor(accessKey: string, url: string) {
    this.client = new Client(
      new RequestManager([
        new HTTPTransport(url, {
          headers: {
            "X-API-Key": accessKey,
          },
        }),
      ])
    );
  }

  async request<T>(
    method: string,
    params?: unknown[] | object,
    schema?: Struct<T>
  ): Promise<T> {
    const result = await this.client.request({ method, params });
    if (!schema) return result;
    return create(result, schema);
  }
}

export function trimTrailingParams(
  params: readonly unknown[]
): readonly unknown[] {
  let end = params.length;
  while (end > 0) {
    if (params[end - 1] !== undefined) break;
    end--;
  }
  return end === params.length ? params : params.slice(0, end);
}

const ErrorDetails = object({
  details: string(),
});
export type ErrorDetails = Infer<typeof ErrorDetails>;

export function errorDetails(error: JSONRPCError): ErrorDetails | undefined {
  return validate(error.data, ErrorDetails)[1];
}
