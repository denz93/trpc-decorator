import "reflect-metadata";
import { describe, expect, test} from "vitest"
import {decorators} from "./fixtures/trpc"

import { CONTEXT_META_KEY, INPUT_META_KEY, METHOD_META_KEY, PROCEDURE_NAME_META_KEY, PROCEDURE_TYPE_META_KEY, ROUTER_META_KEY } from "../utils/metadata";
import z from "zod";
const {route, mutation, query, input, context} = decorators
describe("decorators", () => {
    test("@router", () => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const target: any = {}
        route("demo")(target)
        expect(Reflect.getOwnMetadata(ROUTER_META_KEY, target)).toBe("demo")
    })
    test("@mutation", () => {
        const target = {}
        const method = "say"
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const descriptor: any = {} 
        mutation("public")(target, method, descriptor)
        expect(Reflect.getOwnMetadata(PROCEDURE_TYPE_META_KEY, target, method)).toBe("mutation")
        expect(Reflect.getOwnMetadata(METHOD_META_KEY, target)).toStrictEqual([method])
    })
    test("@query", () => {
        const target = {}
        const method = "say"
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const descriptor: any = {}
        query("public")(target, method, descriptor)
        expect(Reflect.getOwnMetadata(PROCEDURE_TYPE_META_KEY, target, method)).toBe("query")
        expect(Reflect.getOwnMetadata(METHOD_META_KEY, target)).toStrictEqual([method])
        expect(Reflect.getOwnMetadata(PROCEDURE_NAME_META_KEY, target, method)).toStrictEqual("public")
    })
    test("@input", () => {
        const target = {}
        const method = "say"
        const schema = z.string()
        input(schema)(target, method, 0)
        expect(Reflect.getOwnMetadata(INPUT_META_KEY, target, method)).toStrictEqual({index: 0, schema})
    })
    
    test("@context", () => {
        const target = {}
        const method = "say"
        context()(target, method, 0)
        expect(Reflect.getOwnMetadata(CONTEXT_META_KEY, target, method)).toStrictEqual({index: 0})
    })
})