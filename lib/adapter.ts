import { AnyProcedureBuilder } from "@trpc/server/unstable-core-do-not-import";
import { getRouterName, getInputIndex, getInputSchema, getMethodNames, getProcedureName, getProcedureType, getContextIndex } from "./utils/metadata";
import { createQueryDecorator } from "./decorators/query-decorator-factory";
import { createMutationDecorator } from "./decorators/mutation-decorator-factory";
import route from "./decorators/route";
import input from "./decorators/input";
import context from "./decorators/context";

export function registerClassRouters(controllers: any[]) {
    
    return controllers.reduce<Record<string, any>>((router, controller) => {
        const controllerName = getRouterName(controller.constructor);
        const methods = getMethodNames(controller.constructor.prototype);
        router[controllerName] = router[controllerName] || {};
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
                const params = {} as Record<number, any>; 
                if (inputIndex !== undefined) {
                    params[inputIndex] = opts.input
                }
                if (contextIndex !== undefined) {
                    params[contextIndex] = opts.ctx
                }
                const paramList =Object.keys(params).sort((a, b) => +a - +b).map(key => params[+key] )
                
                return (controller[methodName] as Function).call(controller, ...paramList)
            })
        });
        return router
    }, ({} as Record<string, any>))
}



let procedureMap: Record<string, AnyProcedureBuilder> = {};
export function useDecorators<T extends Record<string, AnyProcedureBuilder>> (initialProcedureMap: T) {
    procedureMap = initialProcedureMap;
    const decorators = {
        query: createQueryDecorator<T>(),
        mutation: createMutationDecorator<T>(),
        route,
        input,
        context
    }
    return decorators;
}

export function createTrpcDecoratorRoutes(...classRoutes: any[]) {
    return registerClassRouters(classRoutes)
}