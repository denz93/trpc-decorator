import type { inferParser, Parser } from "@trpc/server/dist/core/parser";
import { defineInputSchema } from "../utils/metadata";

export default function input<T extends Parser, In = inferParser<T>["out"]>(schema: T) {
    // @ts-ignore
    return <_K = In> (target: object, propertyKey: string, parameterIndex: number) => {
        defineInputSchema(target, propertyKey, parameterIndex, schema)
    }
}