import { inferParser, Parser } from "@trpc/server/unstable-core-do-not-import";
import { defineInputSchema } from "../utils/metadata";
export default function input<T extends Parser, In = inferParser<T>["out"]>(schema: T) {
    return function<K = In> (target: object, propertyKey: string, parameterIndex: number) {
        defineInputSchema(target, propertyKey, parameterIndex, schema)
    }
}