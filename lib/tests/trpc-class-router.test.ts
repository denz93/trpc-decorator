import "reflect-metadata";
import { describe, expect, test } from "vitest";
import { createTrpcDecoratorRoutes } from "../adapter";
import {RouteControllerType} from "./types-generated";
import {TestRoute} from "./fixtures/TestRoute";
import {router, createCallerFactory} from "./fixtures/trpc";

describe("TRPC Class Router", () => {
    const classRoutes: RouteControllerType = createTrpcDecoratorRoutes(new TestRoute()) as RouteControllerType
    const appRouter = router(classRoutes)
    const createClient = createCallerFactory(appRouter)
    const client = createClient({})
    
    test("Router should be defined", async () => {
        expect(client["TestRoute"]).toBeDefined()
        
    })

    test("sayHello take a string and return a string", async () => {
        const result = await client.TestRoute.sayHello("test")
        expect(result).toBe("Hello test! How are you?")
    })

    test("updateName take a record and return a new record", async () => {
        const result = await client.TestRoute.updateName({name: "test"})
        expect(result).toStrictEqual({newName: "test"})
    })

    test("internalMethod should NOT be exposed", async () => {
        await expect(async () => {
            // @ts-expect-error : internalMethod should not be exposed on the client
            await client.TestRouter.internalMethod()
        }).rejects.toThrowError()
    })

    test("whoAmI should return a username from context", async () => {
        const result = await client.TestRoute.whoAmI()
        expect(result).toBe("You are John")
        
    })
})
