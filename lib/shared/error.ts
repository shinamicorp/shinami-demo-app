import { Infer, object, string } from "superstruct";

export const ApiErrorBody = object({
  error: string(),
});

export type ApiErrorBody = Infer<typeof ApiErrorBody>;

export function throwExpression(error: any): never {
  throw error;
}
