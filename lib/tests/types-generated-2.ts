import {TRPCQueryProcedure, TRPCMutationProcedure} from "@trpc/server";
export type RouteControllerType = {
    TestRouteWithIoC: {
        calcSum: TRPCQueryProcedure<{
            input: { a: number; b: number; };
            output: number;
        }>;
    };
};
