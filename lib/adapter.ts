import { getRouterName, getInputIndex, getInputSchema, getMethodNames, getProcedureName, getProcedureType, getContextIndex } from "./utils/metadata";
import { createQueryDecorator } from "./decorators/query-decorator-factory";
import { createMutationDecorator } from "./decorators/mutation-decorator-factory";
import route from "./decorators/route";
import input from "./decorators/input";
import context from "./decorators/context";
import type { createRouterFactory } from "@trpc/server/dist/core/router";
import type { AnyProcedureBuilder, ClassType, ContextOfFactory, ProcedureBuilderMap } from "./utils/types";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function registerClassRouters(controllers: any[]) {

    return controllers
    .filter(controller => {
        if (controller.prototype) {
            console.warn(`Class-based route "${controller.name}" is not a instance. Will be ignored!`)
        }
        return !controller.prototype
    })
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    .reduce<Record<string, any>>((router, controller) => {
        const controllerName = getRouterName(controller.constructor);
        const methods = getMethodNames(controller.constructor.prototype);
        router[controllerName] = router[controllerName] || {};
        
        // biome-ignore lint/complexity/noForEach: <explanation>
        methods.forEach(methodName => {
            const procedureName = getProcedureName(controller.constructor.prototype, methodName);
            const procedure = procedureMap[procedureName]
            if (!procedure) {
                throw new Error(`Procedure ${procedureName} is not registered yet`)
            }
            const procedureType = getProcedureType(controller.constructor.prototype, methodName);
            const inputSchema = getInputSchema(controller.constructor.prototype, methodName);
            const inputIndex = getInputIndex(controller.constructor.prototype, methodName);
            const contextIndex = getContextIndex(controller.constructor.prototype, methodName);
            const builder = inputSchema ? procedure.input(inputSchema) : procedure
            router[controllerName][methodName] = builder[procedureType](async (opts) => {
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                const params = {} as Record<number, any>; 
                if (inputIndex !== undefined) {
                    params[inputIndex] = opts.input
                }
                if (contextIndex !== undefined) {
                    params[contextIndex] = opts.ctx
                }
                const paramList =Object.keys(params).sort((a, b) => +a - +b).map(key => params[+key] )
                if (typeof controller[methodName] === "function") {
                    return (controller[methodName]).call(controller, ...paramList)
                }
            })
        });
        return router
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    }, ({} as Record<string, any>))
}



let procedureMap: Record<string, AnyProcedureBuilder> = {};


export function useDecorators<T extends ProcedureBuilderMap> (initialProcedureMap: T) {
    procedureMap = initialProcedureMap;
    const decorators = {
        query: createQueryDecorator<T>(),
        mutation: createMutationDecorator<T>(),
        route,
        input,
        context,
        __ctx: (() => ({} as ContextOfFactory<T>))()
    }
    
    return decorators
}

export function createTrpcDecoratorRoutes(classRoutes: InstanceType<ClassType>[], router? : RouterBuilder) {
    if (router) {
        return registerClassRoutersV10(router, classRoutes)
    }
    return registerClassRouters(classRoutes)

}
type RouterBuilder = ReturnType<typeof createRouterFactory>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function registerClassRoutersV10(router: RouterBuilder, controllers: any[]) {
    const routes = registerClassRouters(controllers)
    return Object.keys(routes).reduce((newRoutes, routeName) => {
        newRoutes[routeName] = router(routes[routeName])
        return newRoutes
    }, {} as Record<string, typeof router>)
}
