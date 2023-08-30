import { Infer, object, string, type } from "superstruct";

export const ApiErrorBody = object({
  error: string(),
});
export type ApiErrorBody = Infer<typeof ApiErrorBody>;
export const WithApiErrorBody = type(ApiErrorBody.schema);
export type WithApiErrorBody = ApiErrorBody;

export function throwExpression(error: any): never {
  throw error;
}
