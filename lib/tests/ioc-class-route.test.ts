import "reflect-metadata";
import { TestRouteWithIoC } from "./fixtures/TestRouteWithIoC";
import { describe, expect, test } from "vitest";
import { RouteControllerType } from "./types-generated-2";
import { createTrpcDecoratorRoutes } from "../adapter";
import { container } from "tsyringe";
import { createCallerFactory, router } from "./fixtures/trpc";
const instance = container.resolve(TestRouteWithIoC)
describe("IoC Class Router", () => {
    
    const classRoutes: RouteControllerType = createTrpcDecoratorRoutes(instance) as RouteControllerType
    const appRouter = router(classRoutes)
    const createClient = createCallerFactory(appRouter)
    const client = createClient({})

    test("Router should be defined", () => {
        expect(client.TestRouteWithIoC).toBeDefined()
    })

    test("calcSum take 10 and 15 and return 25", async () => {
        const result = await client.TestRouteWithIoC.calcSum({a: 10, b: 15})
        expect(result).toBe(25)
    })
})