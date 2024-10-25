import type { AnyRootConfig, ProcedureBuilder, ProcedureParams } from "@trpc/server";
import type { UnsetMarker } from "@trpc/server/dist/core/internals/utils";

 
export interface ClassType {
    new(...args: unknown[]): unknown
}

export type AnyProcedureBuilder = ProcedureBuilder<{
    _config: AnyRootConfig;
    _ctx_out: AnyRootConfig['$types']['ctx'];
    _input_in: UnsetMarker;
    _input_out: UnsetMarker;
    _output_in: UnsetMarker;
    _output_out: UnsetMarker;
    _meta: AnyRootConfig['$types']['meta'];
  }>
export type ProcedureBuilderMap = Record<string, AnyProcedureBuilder>;


type GetParam<T> = T extends ProcedureBuilder<infer U> ? U : never
type GetContext<T> = T extends ProcedureParams<infer _U> ? T["_ctx_out"] : never
export type ContextOfFactory<T extends ProcedureBuilderMap> = {
    [K in keyof T]: GetContext<GetParam<T[K]>>
}

export type ContextOf<T> = T extends {__ctx: infer U} ? U : never