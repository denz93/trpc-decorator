import 'reflect-metadata'
   // --> OFF
import type { Parser } from "@trpc/server/src/core/parser";

// ========================= ROUTER =========================
export const ROUTER_META_KEY = "trpc:route";
export function defineRoute(target: object, name: string) {
    if (!Reflect.hasMetadata(ROUTER_META_KEY, target)) {
        Reflect.defineMetadata(ROUTER_META_KEY, name, target)
    }

}  

export function isRouter(target: object) {
    return Reflect.hasOwnMetadata(ROUTER_META_KEY, target);
}

export function isFunction(target: unknown) {
    return typeof target === "function";
}

export function getRouterName(target: object) {
    return Reflect.getOwnMetadata(ROUTER_META_KEY, target) as string;
}

export const METHOD_META_KEY = "trpc:methods";
export function getMethodNames(target: object) {
    return (Reflect.getOwnMetadata(METHOD_META_KEY, target) || []) as string[]
}


export function addMethod(target: object, methodName: string) {
    if (!Reflect.hasOwnMetadata(METHOD_META_KEY, target)) {
        Reflect.defineMetadata(METHOD_META_KEY, [], target)
    }
    const methods: string[] =  Reflect.getOwnMetadata(METHOD_META_KEY, target);

    methods.push(methodName);
}



// ==================== INPUT ========================

export const INPUT_META_KEY = "trpc:input";
export function getInputSchema(target: object, methodName: string) {
    const obj = (Reflect.getOwnMetadata(INPUT_META_KEY, target, methodName) || {} )as {index?: number, schema?: Parser};
    return obj.schema
}

export function defineInputSchema(target: object, methodName: string, index: number, schema: Parser) {
    Reflect.defineMetadata(INPUT_META_KEY, {index: index, schema}, target, methodName)
}

export function getInputIndex(target: object, methodName: string) {
    const obj = (Reflect.getOwnMetadata(INPUT_META_KEY, target, methodName) || {} ) as {index?: number, schema?: Parser};
    return obj.index
}

export const PROCEDURE_TYPE_META_KEY = "trpc:procedure-type";
export function defineProcedureType(target: object, methodName: string, type: "query" | "mutation") {
    Reflect.defineMetadata(PROCEDURE_TYPE_META_KEY, type, target, methodName)
}

export const PROCEDURE_NAME_META_KEY = "trpc:procedure-name";
export function defineProcedureName(target: object, methodName: string, aclName: string, override = false) {
    if (!override && Reflect.hasOwnMetadata(PROCEDURE_NAME_META_KEY, target, methodName)) {
        return
    }  
    Reflect.defineMetadata(PROCEDURE_NAME_META_KEY, aclName, target, methodName)
}

export function getProcedureType(target: object, methodName: string) {
    return Reflect.getOwnMetadata(PROCEDURE_TYPE_META_KEY, target, methodName) as "query" | "mutation";
}

export function getProcedureName(target: object, methodName: string) {
    return Reflect.getOwnMetadata(PROCEDURE_NAME_META_KEY, target, methodName) as string;
}

export const CONTEXT_META_KEY = "trpc:context";
export function defineContext(target: object, methodName: string, parameterIndex: number) {
    Reflect.defineMetadata(CONTEXT_META_KEY, {index: parameterIndex}, target, methodName)
}

export function isHasContext(target: object, methodName: string) {
    return Reflect.hasOwnMetadata(CONTEXT_META_KEY, target, methodName)
}

export function getContextIndex(target: object, methodName: string) {
    return Reflect.getOwnMetadata(CONTEXT_META_KEY, target, methodName)?.index as number | undefined
}