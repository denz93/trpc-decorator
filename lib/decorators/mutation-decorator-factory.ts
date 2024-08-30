import { addMethod, defineProcedureName, defineProcedureType } from "../utils/metadata"

export function createMutationDecorator<ProcedureMap extends Record<string, any>>() {
    return function decorator(procedureName: keyof ProcedureMap) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            addMethod(target, propertyKey);
            defineProcedureType(target, propertyKey, "mutation");
            defineProcedureName(target, propertyKey, procedureName as string)
    
        }
    }
}