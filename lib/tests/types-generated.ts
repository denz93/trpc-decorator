import {TRPCQueryProcedure, TRPCMutationProcedure} from "@trpc/server";
export type RouteControllerType = {
    TestRoute: {
        sayHello: TRPCQueryProcedure<{
            input: string;
            output: string;
        }>;
        updateName: TRPCMutationProcedure<{
            input: { name: string; };
            output: { newName: string; };
        }>;
        whoAmI: TRPCQueryProcedure<{
            input: void;
            output: string;
        }>;
    };
};
