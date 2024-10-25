import type { BuildProcedure, ProcedureParams, CreateRouterInner, AnyRootConfig } from "@trpc/server";
export type GeneratedRouteTypes = {
    TestRoute: CreateRouterInner<AnyRootConfig, {
        sayHello: BuildProcedure<"query", ProcedureParams<AnyRootConfig, unknown, string, string, unknown, unknown, unknown>, string>;
        updateName: BuildProcedure<"mutation", ProcedureParams<AnyRootConfig, unknown, { name: string; }, { name: string; }, unknown, unknown, unknown>, { newName: string; }>;
        whoAmI: BuildProcedure<"query", ProcedureParams<AnyRootConfig, unknown, void, void, unknown, unknown, unknown>, string>;
    }>;
    UserRoute: CreateRouterInner<AnyRootConfig, {
        sayHello: BuildProcedure<"query", ProcedureParams<AnyRootConfig, unknown, string, string, unknown, unknown, unknown>, string>;
    }>;
    "__user": CreateRouterInner<AnyRootConfig, {
        whoAmI: BuildProcedure<"query", ProcedureParams<AnyRootConfig, unknown, { pronounce: string; }, { pronounce: string; }, unknown, unknown, unknown>, string>;
        updateName: BuildProcedure<"mutation", ProcedureParams<AnyRootConfig, unknown, { name: string; }, { name: string; }, unknown, unknown, unknown>, { newName: string; }>;
    }>;
    TestRouteWithIoC: CreateRouterInner<AnyRootConfig, {
        calcSum: BuildProcedure<"query", ProcedureParams<AnyRootConfig, unknown, { a: number; b: number; }, { a: number; b: number; }, unknown, unknown, unknown>, number>;
    }>;
};