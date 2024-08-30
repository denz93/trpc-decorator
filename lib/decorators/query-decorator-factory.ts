/** eslint-disable @typescript-eslint/no-explicit-any */
import { addMethod, defineProcedureName, defineProcedureType } from "../utils/metadata"

export function createQueryDecorator<ProcedureMap extends Record<string, any>>() {
    return function decorator (procedureName: keyof ProcedureMap) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            addMethod(target, propertyKey);
            defineProcedureType(target, propertyKey, "query");
            defineProcedureName(target, propertyKey, procedureName as string)
        }
    }
}


