import { initTRPC } from '@trpc/server';
import { useDecorators } from '../../adapter';
import type { ContextOf } from '../../utils/types';


export function createApp() {
    /**
     * Initialization of tRPC backend
     * Should be done only once per backend!
     */
    const t = initTRPC.create();
     
    /**
     * Export reusable router and procedure helpers
     * that can be used throughout the router
     */
    const router = t.router;
    const procedure = t.procedure;
    
    const createCallerFactory = t.createCallerFactory
    const authProcedure = procedure.use(async (opts) => {
        return opts.next({
            ctx: {
                user: {
                    name: 'John'
                }
            }
        })
    })
   
    // const decorators = setupTrpcDecorator([procedure, authProcedure])
    const procedureMap = {
        "public": procedure,
        "auth": authProcedure
    }

    const decorators = useDecorators(procedureMap)
    return {
        router,
        procedure,
        createCallerFactory,
        decorators
    }
}

const app = createApp()
export type contextOf = ContextOf<typeof decorators>;
export const {router, procedure, createCallerFactory, decorators} = app
